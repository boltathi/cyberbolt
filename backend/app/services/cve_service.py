"""CVE Feed service — fetch recent CVEs from public APIs."""
import json
import requests
from datetime import datetime, timezone, timedelta
from ..extensions import redis_data


# CISA Known Exploited Vulnerabilities catalog URL
CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"

# NVD API v2
NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

CACHE_KEY = "cve_feed:cache"
CACHE_TTL = 3600  # 1 hour


class CVEService:
    """Fetches and caches recent CVEs from public sources."""

    @staticmethod
    def get_recent_cves(limit: int = 20) -> dict:
        """Get recent CVEs. Uses Redis cache to avoid hammering APIs."""
        # Check cache first
        cached = redis_data.get(CACHE_KEY)
        if cached:
            try:
                data = json.loads(cached)
                # Slice to requested limit
                data["cves"] = data["cves"][:limit]
                data["total"] = len(data["cves"])
                return data
            except (json.JSONDecodeError, KeyError):
                pass

        # Fetch fresh data
        cves = CVEService._fetch_nvd_recent(limit=50)
        kev_ids = CVEService._fetch_kev_ids()

        # Mark KEV status
        for cve in cves:
            cve["in_kev"] = cve["id"] in kev_ids

        result = {
            "cves": cves,
            "total": len(cves),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "source": "NVD (National Vulnerability Database)",
        }

        # Cache the full result
        try:
            redis_data.setex(CACHE_KEY, CACHE_TTL, json.dumps(result))
        except Exception:
            pass

        # Slice for response
        result["cves"] = result["cves"][:limit]
        result["total"] = len(result["cves"])
        return result

    @staticmethod
    def _fetch_nvd_recent(limit: int = 50) -> list[dict]:
        """Fetch recent CVEs from NVD API v2."""
        try:
            # Get CVEs from the last 7 days
            now = datetime.now(timezone.utc)
            week_ago = now - timedelta(days=7)

            params = {
                "pubStartDate": week_ago.strftime("%Y-%m-%dT00:00:00.000"),
                "pubEndDate": now.strftime("%Y-%m-%dT23:59:59.999"),
                "resultsPerPage": min(limit, 50),
            }

            resp = requests.get(NVD_API_URL, params=params, timeout=15, headers={
                "User-Agent": "CyberBolt/1.0 (cyberbolt.in)"
            })
            resp.raise_for_status()
            data = resp.json()

            cves = []
            for item in data.get("vulnerabilities", [])[:limit]:
                cve_data = item.get("cve", {})
                cve_id = cve_data.get("id", "")

                # Get English description
                descriptions = cve_data.get("descriptions", [])
                description = ""
                for d in descriptions:
                    if d.get("lang") == "en":
                        description = d.get("value", "")
                        break

                # Get CVSS score
                metrics = cve_data.get("metrics", {})
                cvss_score = None
                cvss_severity = "UNKNOWN"
                cvss_vector = ""

                # Try CVSS v3.1 first, then v3.0, then v2.0
                for version_key in ["cvssMetricV31", "cvssMetricV30", "cvssMetricV2"]:
                    metric_list = metrics.get(version_key, [])
                    if metric_list:
                        cvss_data = metric_list[0].get("cvssData", {})
                        cvss_score = cvss_data.get("baseScore")
                        cvss_severity = metric_list[0].get("baseSeverity", cvss_data.get("baseSeverity", "UNKNOWN"))
                        cvss_vector = cvss_data.get("vectorString", "")
                        break

                # Get references
                references = []
                for ref in cve_data.get("references", [])[:3]:
                    references.append({
                        "url": ref.get("url", ""),
                        "source": ref.get("source", ""),
                    })

                # Get published date
                published = cve_data.get("published", "")

                # Get weaknesses (CWE)
                weaknesses = []
                for w in cve_data.get("weaknesses", []):
                    for d in w.get("description", []):
                        if d.get("lang") == "en":
                            weaknesses.append(d.get("value", ""))

                cves.append({
                    "id": cve_id,
                    "description": description[:500],
                    "cvss_score": cvss_score,
                    "cvss_severity": cvss_severity.upper() if cvss_severity else "UNKNOWN",
                    "cvss_vector": cvss_vector,
                    "published": published,
                    "references": references,
                    "weaknesses": weaknesses[:3],
                    "in_kev": False,
                    "nvd_url": f"https://nvd.nist.gov/vuln/detail/{cve_id}",
                })

            # Sort by published date (newest first)
            cves.sort(key=lambda x: x.get("published", ""), reverse=True)
            return cves

        except Exception:
            return CVEService._get_fallback_cves()

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
        """Return fallback data when APIs are unreachable."""
        return [
            {
                "id": "CVE-2024-3094",
                "description": "Malicious code was discovered in the upstream tarballs of xz-utils, starting with version 5.6.0. The backdoor manipulated the build process via a series of complex obfuscations to inject code into the liblzma library, targeting the sshd authentication process.",
                "cvss_score": 10.0,
                "cvss_severity": "CRITICAL",
                "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
                "published": "2024-03-29T17:15:00.000",
                "references": [{"url": "https://nvd.nist.gov/vuln/detail/CVE-2024-3094", "source": "nvd.nist.gov"}],
                "weaknesses": ["CWE-506"],
                "in_kev": True,
                "nvd_url": "https://nvd.nist.gov/vuln/detail/CVE-2024-3094",
            },
            {
                "id": "CVE-2024-21762",
                "description": "An out-of-bound write vulnerability in Fortinet FortiOS allows a remote unauthenticated attacker to execute arbitrary code or command via specially crafted HTTP requests.",
                "cvss_score": 9.8,
                "cvss_severity": "CRITICAL",
                "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
                "published": "2024-02-09T10:15:00.000",
                "references": [{"url": "https://nvd.nist.gov/vuln/detail/CVE-2024-21762", "source": "nvd.nist.gov"}],
                "weaknesses": ["CWE-787"],
                "in_kev": True,
                "nvd_url": "https://nvd.nist.gov/vuln/detail/CVE-2024-21762",
            },
            {
                "id": "CVE-2023-44487",
                "description": "The HTTP/2 protocol allows a denial of service (server resource consumption) because request cancellation can reset many streams quickly, causing asymmetric resource consumption known as 'Rapid Reset'.",
                "cvss_score": 7.5,
                "cvss_severity": "HIGH",
                "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
                "published": "2023-10-10T14:15:00.000",
                "references": [{"url": "https://nvd.nist.gov/vuln/detail/CVE-2023-44487", "source": "nvd.nist.gov"}],
                "weaknesses": ["CWE-400"],
                "in_kev": True,
                "nvd_url": "https://nvd.nist.gov/vuln/detail/CVE-2023-44487",
            },
        ]
