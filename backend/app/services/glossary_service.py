"""Glossary service — cybersecurity terminology database."""


# Hardcoded glossary of cybersecurity terms, grouped by first letter.
# Each term has: term, definition, category, related_terms (optional list of slugs)
GLOSSARY_TERMS = [
    {
        "term": "Access Control",
        "slug": "access-control",
        "definition": "Security mechanism that determines who or what can view or use resources in a computing environment. Includes authentication (verifying identity) and authorization (granting permissions).",
        "category": "Security Fundamentals",
    },
    {
        "term": "Adversarial Machine Learning",
        "slug": "adversarial-machine-learning",
        "definition": "The study of attacks on machine learning models and defenses against them. Includes evasion attacks (fooling models at inference), poisoning attacks (corrupting training data), and model extraction.",
        "category": "AI Security",
    },
    {
        "term": "API Security",
        "slug": "api-security",
        "definition": "Practices and tools for protecting Application Programming Interfaces from attacks. Covers authentication, rate limiting, input validation, and preventing data exposure through API endpoints.",
        "category": "Web Security",
    },
    {
        "term": "Attack Surface",
        "slug": "attack-surface",
        "definition": "The total number of points (vectors) where an unauthorized user can try to enter or extract data from a system. Reducing attack surface is a core security principle.",
        "category": "Security Fundamentals",
    },
    {
        "term": "Authentication",
        "slug": "authentication",
        "definition": "The process of verifying the identity of a user, device, or system. Common methods include passwords, multi-factor authentication (MFA), biometrics, and cryptographic tokens like JWT.",
        "category": "Security Fundamentals",
    },
    {
        "term": "Authorization",
        "slug": "authorization",
        "definition": "The process of determining what permissions an authenticated user has. Defines what resources a user can access and what actions they can perform (read, write, delete).",
        "category": "Security Fundamentals",
    },
    {
        "term": "Backdoor",
        "slug": "backdoor",
        "definition": "A covert method of bypassing normal authentication or security controls in a system. Can be intentionally placed by developers or installed by attackers after compromising a system.",
        "category": "Threats",
    },
    {
        "term": "Blue Team",
        "slug": "blue-team",
        "definition": "The defensive security team responsible for protecting an organization's systems. Blue teams monitor for threats, respond to incidents, maintain security controls, and improve defenses.",
        "category": "Security Operations",
    },
    {
        "term": "Brute Force Attack",
        "slug": "brute-force-attack",
        "definition": "An attack that tries every possible combination of passwords or keys until the correct one is found. Mitigated by rate limiting, account lockout policies, and strong password requirements.",
        "category": "Threats",
    },
    {
        "term": "Buffer Overflow",
        "slug": "buffer-overflow",
        "definition": "A vulnerability where a program writes data beyond the boundary of allocated memory. Can allow attackers to overwrite adjacent memory, crash programs, or execute arbitrary code.",
        "category": "Vulnerabilities",
    },
    {
        "term": "CIA Triad",
        "slug": "cia-triad",
        "definition": "The three pillars of information security: Confidentiality (data is only accessible to authorized parties), Integrity (data is accurate and unaltered), and Availability (systems are accessible when needed).",
        "category": "Security Fundamentals",
    },
    {
        "term": "CORS",
        "slug": "cors",
        "definition": "Cross-Origin Resource Sharing — a browser security mechanism that controls which domains can make requests to your API. Misconfigured CORS can allow unauthorized cross-origin data access.",
        "category": "Web Security",
    },
    {
        "term": "Credential Stuffing",
        "slug": "credential-stuffing",
        "definition": "An attack where stolen username/password pairs from one breach are automatically tested against other services. Relies on password reuse across sites. Mitigated by MFA and breach monitoring.",
        "category": "Threats",
    },
    {
        "term": "Cross-Site Request Forgery (CSRF)",
        "slug": "csrf",
        "definition": "An attack that tricks a user's browser into performing unwanted actions on a site where they're authenticated. Prevented by anti-CSRF tokens, SameSite cookies, and checking the Origin header.",
        "category": "Web Security",
    },
    {
        "term": "Cross-Site Scripting (XSS)",
        "slug": "xss",
        "definition": "A vulnerability where an attacker injects malicious scripts into web pages viewed by other users. Types include Stored XSS, Reflected XSS, and DOM-based XSS. Prevented by input sanitization and Content Security Policy.",
        "category": "Web Security",
    },
    {
        "term": "Cryptographic Hash",
        "slug": "cryptographic-hash",
        "definition": "A one-way function that converts input data into a fixed-size string. Used for password storage (bcrypt, Argon2), file integrity verification (SHA-256), and digital signatures. Cannot be reversed.",
        "category": "Cryptography",
    },
    {
        "term": "CVE",
        "slug": "cve",
        "definition": "Common Vulnerabilities and Exposures — a standardized system for identifying and cataloging publicly known cybersecurity vulnerabilities. Each CVE has a unique ID (e.g., CVE-2024-1234) and is tracked in the NVD.",
        "category": "Vulnerability Management",
    },
    {
        "term": "CVSS",
        "slug": "cvss",
        "definition": "Common Vulnerability Scoring System — a framework for rating the severity of security vulnerabilities on a 0-10 scale. Considers attack vector, complexity, privileges required, and impact on confidentiality/integrity/availability.",
        "category": "Vulnerability Management",
    },
    {
        "term": "Data Exfiltration",
        "slug": "data-exfiltration",
        "definition": "The unauthorized transfer of data from within an organization to an external destination. Methods include DNS tunneling, covert channels, and compromised email. A key objective in many cyberattacks.",
        "category": "Threats",
    },
    {
        "term": "Defense in Depth",
        "slug": "defense-in-depth",
        "definition": "A security strategy that layers multiple defensive mechanisms so that if one layer fails, others still protect the system. Examples: firewall + WAF + input validation + output encoding + CSP.",
        "category": "Security Fundamentals",
    },
    {
        "term": "DevSecOps",
        "slug": "devsecops",
        "definition": "The practice of integrating security into every phase of the software development lifecycle (SDLC), from design through deployment. Includes automated security testing in CI/CD pipelines, SAST, DAST, and dependency scanning.",
        "category": "DevSecOps",
    },
    {
        "term": "DDoS",
        "slug": "ddos",
        "definition": "Distributed Denial of Service — an attack that overwhelms a target system with traffic from many sources, making it unavailable to legitimate users. Mitigated by CDNs, rate limiting, and traffic filtering.",
        "category": "Threats",
    },
    {
        "term": "Encryption",
        "slug": "encryption",
        "definition": "The process of converting plaintext data into ciphertext using an algorithm and key, making it unreadable without the decryption key. Types: symmetric (AES), asymmetric (RSA), and at-rest vs in-transit.",
        "category": "Cryptography",
    },
    {
        "term": "Endpoint Detection and Response (EDR)",
        "slug": "edr",
        "definition": "Security tools that continuously monitor endpoints (laptops, servers, phones) for suspicious activity, provide real-time visibility, and enable rapid response to threats.",
        "category": "Security Operations",
    },
    {
        "term": "Exploit",
        "slug": "exploit",
        "definition": "A piece of code or technique that takes advantage of a vulnerability in software or hardware to cause unintended behavior, such as gaining unauthorized access or executing malicious code.",
        "category": "Threats",
    },
    {
        "term": "Firewall",
        "slug": "firewall",
        "definition": "A network security device or software that monitors and filters incoming and outgoing traffic based on predefined rules. Types include network firewalls, host-based firewalls, and web application firewalls (WAF).",
        "category": "Network Security",
    },
    {
        "term": "Hash Collision",
        "slug": "hash-collision",
        "definition": "When two different inputs produce the same hash output. Collision attacks can compromise hash-based systems. MD5 and SHA-1 are vulnerable; SHA-256 and SHA-3 are collision-resistant.",
        "category": "Cryptography",
    },
    {
        "term": "Honeypot",
        "slug": "honeypot",
        "definition": "A decoy system designed to attract and trap attackers, allowing security teams to study attack methods and gather intelligence without risking production systems.",
        "category": "Security Operations",
    },
    {
        "term": "Incident Response",
        "slug": "incident-response",
        "definition": "The organized approach to addressing and managing a security breach or cyberattack. Phases: Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned.",
        "category": "Security Operations",
    },
    {
        "term": "Injection Attack",
        "slug": "injection-attack",
        "definition": "A class of attacks where untrusted data is sent to an interpreter as part of a command or query. Includes SQL injection, OS command injection, LDAP injection, and NoSQL injection. OWASP Top 10 #3.",
        "category": "Web Security",
    },
    {
        "term": "Intrusion Detection System (IDS)",
        "slug": "ids",
        "definition": "A system that monitors network traffic or host activity for signs of malicious behavior. Can be signature-based (matching known patterns) or anomaly-based (detecting deviations from normal behavior).",
        "category": "Network Security",
    },
    {
        "term": "JSON Web Token (JWT)",
        "slug": "jwt",
        "definition": "A compact, self-contained token format for securely transmitting information between parties as a JSON object. Consists of header.payload.signature. Used for stateless authentication in REST APIs.",
        "category": "Security Fundamentals",
    },
    {
        "term": "Keylogger",
        "slug": "keylogger",
        "definition": "Malware or hardware that records keystrokes on a compromised system, capturing passwords, credit card numbers, and other sensitive data entered by the user.",
        "category": "Malware",
    },
    {
        "term": "Lateral Movement",
        "slug": "lateral-movement",
        "definition": "Techniques attackers use to move through a network after initial compromise, accessing additional systems and escalating privileges. Common in Advanced Persistent Threats (APTs).",
        "category": "Threats",
    },
    {
        "term": "Least Privilege",
        "slug": "least-privilege",
        "definition": "A security principle that users and processes should only have the minimum permissions necessary to perform their tasks. Limits the blast radius of compromised accounts.",
        "category": "Security Fundamentals",
    },
    {
        "term": "Malware",
        "slug": "malware",
        "definition": "Malicious software designed to damage, disrupt, or gain unauthorized access to systems. Types include viruses, worms, trojans, ransomware, spyware, and rootkits.",
        "category": "Malware",
    },
    {
        "term": "Man-in-the-Middle (MITM)",
        "slug": "mitm",
        "definition": "An attack where the attacker secretly intercepts and relays communication between two parties who believe they are communicating directly. Prevented by TLS/HTTPS and certificate pinning.",
        "category": "Threats",
    },
    {
        "term": "Multi-Factor Authentication (MFA)",
        "slug": "mfa",
        "definition": "An authentication method requiring two or more verification factors: something you know (password), something you have (phone/token), or something you are (biometrics). Dramatically reduces account compromise.",
        "category": "Security Fundamentals",
    },
    {
        "term": "NIST Cybersecurity Framework",
        "slug": "nist-csf",
        "definition": "A widely adopted framework for managing cybersecurity risk. Five core functions: Identify, Protect, Detect, Respond, Recover. Provides standards and best practices for organizations of all sizes.",
        "category": "Compliance",
    },
    {
        "term": "OWASP",
        "slug": "owasp",
        "definition": "Open Worldwide Application Security Project — a nonprofit foundation that produces free resources for web application security. Best known for the OWASP Top 10 list of critical security risks.",
        "category": "Security Fundamentals",
    },
    {
        "term": "OWASP Top 10",
        "slug": "owasp-top-10",
        "definition": "A regularly updated list of the 10 most critical web application security risks. The 2021 edition includes Broken Access Control (#1), Cryptographic Failures (#2), and Injection (#3). The standard awareness document for web security.",
        "category": "Web Security",
    },
    {
        "term": "Patch Management",
        "slug": "patch-management",
        "definition": "The process of acquiring, testing, and installing software updates (patches) to fix vulnerabilities. Critical for preventing exploitation of known vulnerabilities like those listed in CISA KEV.",
        "category": "Vulnerability Management",
    },
    {
        "term": "Penetration Testing",
        "slug": "penetration-testing",
        "definition": "An authorized simulated cyberattack on a system to evaluate its security. Pen testers use the same tools and techniques as attackers to find vulnerabilities before malicious actors do.",
        "category": "Security Operations",
    },
    {
        "term": "Phishing",
        "slug": "phishing",
        "definition": "A social engineering attack that tricks victims into revealing sensitive information or installing malware through deceptive emails, websites, or messages. Variants include spear phishing (targeted) and whaling (executives).",
        "category": "Threats",
    },
    {
        "term": "Privilege Escalation",
        "slug": "privilege-escalation",
        "definition": "An attack where a user gains higher access rights than intended. Vertical escalation: regular user → admin. Horizontal escalation: accessing another user's resources. A key step in many attack chains.",
        "category": "Threats",
    },
    {
        "term": "Prompt Injection",
        "slug": "prompt-injection",
        "definition": "An attack against Large Language Models (LLMs) where carefully crafted input causes the model to ignore its instructions, leak system prompts, or perform unintended actions. Analogous to SQL injection for AI systems.",
        "category": "AI Security",
    },
    {
        "term": "Ransomware",
        "slug": "ransomware",
        "definition": "Malware that encrypts a victim's files and demands payment (usually cryptocurrency) for the decryption key. Modern variants also exfiltrate data for double extortion. Major threat to organizations worldwide.",
        "category": "Malware",
    },
    {
        "term": "Rate Limiting",
        "slug": "rate-limiting",
        "definition": "A technique to control the number of requests a user can make to an API within a time window. Prevents brute force attacks, DDoS, and resource exhaustion. Typically implemented per IP or per user.",
        "category": "Web Security",
    },
    {
        "term": "Red Team",
        "slug": "red-team",
        "definition": "An offensive security team that simulates real-world attacks against an organization to test its defenses. Red teams think and act like adversaries to uncover weaknesses that automated tools miss.",
        "category": "Security Operations",
    },
    {
        "term": "Reverse Engineering",
        "slug": "reverse-engineering",
        "definition": "The process of analyzing software or hardware to understand its design, functionality, or vulnerabilities without access to source code. Used in malware analysis, vulnerability research, and security auditing.",
        "category": "Security Operations",
    },
    {
        "term": "SAST",
        "slug": "sast",
        "definition": "Static Application Security Testing — analyzing source code for security vulnerabilities without executing the program. Finds issues like SQL injection, XSS, and hardcoded secrets during development.",
        "category": "DevSecOps",
    },
    {
        "term": "Security Headers",
        "slug": "security-headers",
        "definition": "HTTP response headers that enable browser security features. Key headers: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options, X-Content-Type-Options, and Permissions-Policy.",
        "category": "Web Security",
    },
    {
        "term": "SIEM",
        "slug": "siem",
        "definition": "Security Information and Event Management — platforms that aggregate log data from across an organization, correlate events, detect anomalies, and provide real-time security alerts and incident investigation tools.",
        "category": "Security Operations",
    },
    {
        "term": "Social Engineering",
        "slug": "social-engineering",
        "definition": "Manipulating people into divulging confidential information or performing actions that compromise security. Exploits human psychology rather than technical vulnerabilities. Includes phishing, pretexting, and baiting.",
        "category": "Threats",
    },
    {
        "term": "SQL Injection",
        "slug": "sql-injection",
        "definition": "An attack where malicious SQL code is inserted into application queries through user input, allowing attackers to read, modify, or delete database data. Prevented by parameterized queries and input validation.",
        "category": "Web Security",
    },
    {
        "term": "Supply Chain Attack",
        "slug": "supply-chain-attack",
        "definition": "An attack that targets less-secure elements in a supply chain to compromise the final product. In software, this includes compromising open-source dependencies, build systems, or update mechanisms (e.g., SolarWinds).",
        "category": "Threats",
    },
    {
        "term": "Threat Intelligence",
        "slug": "threat-intelligence",
        "definition": "Evidence-based knowledge about cyber threats, including indicators of compromise (IOCs), tactics, techniques, and procedures (TTPs), and contextual information used to make informed security decisions.",
        "category": "Security Operations",
    },
    {
        "term": "Threat Modeling",
        "slug": "threat-modeling",
        "definition": "A structured approach to identifying, quantifying, and addressing security threats to a system. Frameworks include STRIDE (Microsoft), PASTA, and LINDDUN. Done during the design phase of development.",
        "category": "DevSecOps",
    },
    {
        "term": "TLS/SSL",
        "slug": "tls-ssl",
        "definition": "Transport Layer Security (TLS) and its predecessor Secure Sockets Layer (SSL) are cryptographic protocols that provide secure communication over networks. HTTPS = HTTP + TLS. Uses certificates for server authentication.",
        "category": "Cryptography",
    },
    {
        "term": "Token",
        "slug": "token",
        "definition": "A piece of data used to represent a user's identity or session. Types include JWT (JSON Web Tokens), OAuth access tokens, API keys, and session tokens. Stored in cookies, headers, or localStorage.",
        "category": "Security Fundamentals",
    },
    {
        "term": "Vulnerability",
        "slug": "vulnerability",
        "definition": "A weakness in software, hardware, or processes that can be exploited by attackers. Vulnerabilities are cataloged as CVEs and rated by CVSS severity. Regular patching and scanning are critical countermeasures.",
        "category": "Vulnerability Management",
    },
    {
        "term": "Web Application Firewall (WAF)",
        "slug": "waf",
        "definition": "A security layer that monitors, filters, and blocks HTTP traffic to and from a web application. Protects against common attacks like SQL injection, XSS, and CSRF. Can be cloud-based or on-premises.",
        "category": "Web Security",
    },
    {
        "term": "Zero-Day",
        "slug": "zero-day",
        "definition": "A vulnerability that is unknown to the software vendor and has no available patch. Zero-day exploits are highly valuable to attackers (and on the black market) because no defense exists yet.",
        "category": "Vulnerability Management",
    },
    {
        "term": "Zero Trust",
        "slug": "zero-trust",
        "definition": "A security model that assumes no user or system — inside or outside the network — should be trusted by default. Every request must be verified. Principles: never trust, always verify; least privilege; assume breach.",
        "category": "Security Fundamentals",
    },
]


class GlossaryService:
    """In-memory glossary — no Redis needed, terms are hardcoded."""

    @staticmethod
    def get_all(query: str = "", category: str = ""):
        """Return all terms, optionally filtered by search query or category."""
        terms = GLOSSARY_TERMS
        if category:
            cat_lower = category.lower()
            terms = [t for t in terms if t["category"].lower() == cat_lower]
        if query:
            q = query.lower()
            terms = [
                t for t in terms
                if q in t["term"].lower() or q in t["definition"].lower()
            ]
        return sorted(terms, key=lambda t: t["term"].lower())

    @staticmethod
    def get_by_slug(slug: str):
        """Get a single term by slug."""
        for t in GLOSSARY_TERMS:
            if t["slug"] == slug:
                return t
        return None

    @staticmethod
    def get_categories():
        """Return unique glossary categories with counts."""
        cats: dict[str, int] = {}
        for t in GLOSSARY_TERMS:
            c = t["category"]
            cats[c] = cats.get(c, 0) + 1
        return sorted([{"name": k, "count": v} for k, v in cats.items()], key=lambda x: x["name"])

    @staticmethod
    def count():
        return len(GLOSSARY_TERMS)
