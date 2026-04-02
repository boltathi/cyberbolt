"""Newsletter subscription endpoint — stores emails in Redis."""
import re
from datetime import datetime, timezone
from flask import request
from flask_restx import Namespace, Resource
from ...extensions import limiter, redis_data

ns = Namespace("newsletter", description="Newsletter subscriptions")

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
MAX_SUBSCRIBERS = 10000


@ns.route("/subscribe")
class NewsletterSubscribe(Resource):
    @limiter.limit("5/minute")
    def post(self):
        """Subscribe an email to the newsletter."""
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return {"error": "Missing JSON body", "message": "Missing JSON body"}, 400

        email = (data.get("email") or "").strip().lower()
        if not email or not EMAIL_RE.match(email):
            return {"error": "Invalid email", "message": "Please provide a valid email address"}, 400

        if len(email) > 254:
            return {"error": "Email too long", "message": "Email address is too long"}, 400

        if not redis_data:
            return {"error": "Service unavailable", "message": "Newsletter service is temporarily unavailable"}, 503

        # Check subscriber count
        count = redis_data.scard("newsletter:subscribers")
        if count and count >= MAX_SUBSCRIBERS:
            return {"error": "Limit reached", "message": "Newsletter is currently full"}, 429

        # Check if already subscribed
        if redis_data.sismember("newsletter:subscribers", email):
            return {"message": "You're already subscribed!"}, 200

        # Add subscriber
        redis_data.sadd("newsletter:subscribers", email)
        redis_data.hset(f"newsletter:meta:{email}", mapping={
            "subscribed_at": datetime.now(timezone.utc).isoformat(),
            "status": "active",
        })

        return {"message": "Successfully subscribed! Welcome aboard."}, 201
