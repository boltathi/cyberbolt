"""CVE Feed service — fetch AI/ML-related CVEs from NVD API v2."""
import json
import os
import time
import requests
from datetime import datetime, timezone, timedelta
from ..extensions import redis_data


# CISA Known Exploited Vulnerabilities catalog URL
CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"

# NVD API v2
NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

# NVD API key (50 req/30s with key vs 5 req/30s without)
NVD_API_KEY = os.getenv("NVD_API_KEY", "")

CACHE_KEY = "cve_feed:ai_cache"
CACHE_TTL = 604800  # 7 days

# AI/ML keyword phrases for NVD keywordSearch queries.
# Each is searched against CVE descriptions via the NVD API.
AI_KEYWORDS = [
    "artificial intelligence",
    "machine learning",
    "large language model",
    "deep learning",
    "neural network",
    "generative AI",
    "prompt injection",
    "model poisoning",
    "adversarial machine learning",
    "tensorflow",
    "pytorch",
    "langchain",
    "hugging face",
    "openai",
    "chatbot",
    "natural language processing",
]


class CVEService:
    """Fetches and caches AI/ML-related CVEs from NVD."""

    @staticmethod
    def get_recent_cves(limit: int = 20) -> dict:
        """Get recent AI/ML CVEs. Uses 7-day Redis cache."""
        # Check cache first
        cached = redis_data.get(CACHE_KEY)
        if cached:
            try:
                data = json.loads(cached)
                data["cves"] = data["cves"][:limit]
                data["total"] = len(data["cves"])
                return data
            except (json.JSONDecodeError, KeyError):
                pass

        # Fetch fresh data
        cves = CVEService._fetch_ai_cves()
        kev_ids = CVEService._fetch_kev_ids()

        # Mark KEV status
        for cve in cves:
            cve["in_kev"] = cve["id"] in kev_ids

        result = {
            "cves": cves,
            "total": len(cves),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "source": "NVD (National Vulnerability Database) — AI/ML filtered",
        }

        # Cache the full result for 7 days
        try:
            redis_data.setex(CACHE_KEY, CACHE_TTL, json.dumps(result))
        except Exception:
            pass

        # Slice for response
        result["cves"] = result["cves"][:limit]
        result["total"] = len(result["cves"])
        return result

    @staticmethod
    def _fetch_ai_cves() -> list[dict]:
        """Fetch AI/ML-related CVEs using NVD keywordSearch param.

        Makes one API call per keyword (with API key for 50 req/30s limit).
        Uses a 30-day lookback window so the 7-day cache always has data.
        Deduplicates results by CVE ID.
        """
        all_cves: dict[str, dict] = {}  # CVE ID -> parsed dict

        now = datetime.now(timezone.utc)
        month_ago = now - timedelta(days=30)

        headers = {"User-Agent": "CyberBolt/1.0 (cyberbolt.in)"}
        if NVD_API_KEY:
            headers["apiKey"] = NVD_API_KEY

        for keyword in AI_KEYWORDS:
            try:
                params = {
                    "keywordSearch": keyword,
                    "pubStartDate": month_ago.strftime("%Y-%m-%dT00:00:00.000"),
                    "pubEndDate": now.strftime("%Y-%m-%dT23:59:59.999"),
                    "resultsPerPage": 50,
                }

                resp = requests.get(
                    NVD_API_URL, params=params, timeout=20, headers=headers
                )
                resp.raise_for_status()
                data = resp.json()

                for item in data.get("vulnerabilities", []):
                    parsed = CVEService._parse_cve(item)
                    if parsed and parsed["id"] not in all_cves:
                        all_cves[parsed["id"]] = parsed

                # Polite delay between NVD API calls
                time.sleep(2)

            except Exception:
                continue  # Skip failed keyword, try next

        if not all_cves:
            return CVEService._get_fallback_cves()

        # Sort by published date (newest first)
        return sorted(
            all_cves.values(),
            key=lambda x: x.get("published", ""),
            reverse=True,
        )

    @staticmethod
    def _parse_cve(item: dict) -> dict | None:
        """Parse a single CVE item from NVD API response."""
        try:
            cve_data = item.get("cve", {})
            cve_id = cve_data.get("id", "")
            if not cve_id:
                return None

            # English description
            description = ""
            for d in cve_data.get("descriptions", []):
                if d.get("lang") == "en":
                    description = d.get("value", "")
                    break

            # CVSS score — try v3.1, then v3.0, then v2.0
            metrics = cve_data.get("metrics", {})
            cvss_score = None
            cvss_severity = "UNKNOWN"
            cvss_vector = ""

            for version_key in ["cvssMetricV31", "cvssMetricV30", "cvssMetricV2"]:
                metric_list = metrics.get(version_key, [])
                if metric_list:
                    cvss_data = metric_list[0].get("cvssData", {})
                    cvss_score = cvss_data.get("baseScore")
                    cvss_severity = metric_list[0].get(
                        "baseSeverity",
                        cvss_data.get("baseSeverity", "UNKNOWN"),
                    )
                    cvss_vector = cvss_data.get("vectorString", "")
                    break

            # References (first 3)
            references = [
                {"url": ref.get("url", ""), "source": ref.get("source", "")}
                for ref in cve_data.get("references", [])[:3]
            ]

            # Published date
            published = cve_data.get("published", "")

            # Weaknesses (CWE)
            weaknesses = []
            for w in cve_data.get("weaknesses", []):
                for d in w.get("description", []):
                    if d.get("lang") == "en":
                        weaknesses.append(d.get("value", ""))

            return {
                "id": cve_id,
                "description": description[:500],
                "cvss_score": cvss_score,
                "cvss_severity": (
                    cvss_severity.upper() if cvss_severity else "UNKNOWN"
                ),
                "cvss_vector": cvss_vector,
                "published": published,
                "references": references,
                "weaknesses": weaknesses[:3],
                "in_kev": False,
                "nvd_url": f"https://nvd.nist.gov/vuln/detail/{cve_id}",
            }
        except Exception:
            return None

    @staticmethod
    def _fetch_kev_ids() -> set:
        """Fetch CISA Known Exploited Vulnerabilities IDs."""
        try:
            resp = requests.get(CISA_KEV_URL, timeout=10, headers={
                "User-Agent": "CyberBolt/1.0 (cyberbolt.in)"
            })
            resp.raise_for_status()
            data = resp.json()
            return {v["cveID"] for v in data.get("vulnerabilities", [])}
        except Exception:
            return set()

    @staticmethod
    def _get_fallback_cves() -> list[dict]:
        """Return AI/ML-related fallback CVEs when NVD API is unreachable."""
        return [
            {
                "id": "CVE-2024-5480",
                "description": "A critical remote code execution vulnerability in PyTorch TorchServe allows attackers to execute arbitrary code by sending specially crafted model inference requests that bypass input validation in the management API.",
                "cvss_score": 9.8,
                "cvss_severity": "CRITICAL",
                "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
                "published": "2024-06-06T19:15:00.000",
                "references": [{"url": "https://nvd.nist.gov/vuln/detail/CVE-2024-5480", "source": "nvd.nist.gov"}],
                "weaknesses": ["CWE-77"],
                "in_kev": False,
                "nvd_url": "https://nvd.nist.gov/vuln/detail/CVE-2024-5480",
            },
            {
                "id": "CVE-2024-34359",
                "description": "llama-cpp-python, a Python binding for llama.cpp, is vulnerable to a Jinja2 Server-Side Template Injection that allows remote code execution via crafted chat templates in GGUF model metadata.",
                "cvss_score": 9.8,
                "cvss_severity": "CRITICAL",
                "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
                "published": "2024-06-06T18:15:00.000",
                "references": [{"url": "https://nvd.nist.gov/vuln/detail/CVE-2024-34359", "source": "nvd.nist.gov"}],
                "weaknesses": ["CWE-1336"],
                "in_kev": False,
                "nvd_url": "https://nvd.nist.gov/vuln/detail/CVE-2024-34359",
            },
            {
                "id": "CVE-2024-3660",
                "description": "A arbitrary code execution vulnerability in TensorFlow Keras model loading allows attackers to execute arbitrary Python code when a user loads a maliciously crafted .keras model file via Lambda layers.",
                "cvss_score": 8.1,
                "cvss_severity": "HIGH",
                "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N",
                "published": "2024-04-16T00:15:00.000",
                "references": [{"url": "https://nvd.nist.gov/vuln/detail/CVE-2024-3660", "source": "nvd.nist.gov"}],
                "weaknesses": ["CWE-94"],
                "in_kev": False,
                "nvd_url": "https://nvd.nist.gov/vuln/detail/CVE-2024-3660",
            },
        ]
