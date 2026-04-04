"""CVE Feed endpoints — public threat intelligence."""
from flask import request
from flask_restx import Namespace, Resource
from ...services.cve_service import CVEService
from ...extensions import limiter

ns = Namespace("cve", description="CVE threat intelligence feed")


@ns.route("/recent")
class RecentCVEs(Resource):
    @limiter.limit("20/minute")
    def get(self):
        """Get recent CVEs from the National Vulnerability Database."""
        limit = max(1, min(request.args.get("limit", 20, type=int), 50))
        return CVEService.get_recent_cves(limit=limit)
