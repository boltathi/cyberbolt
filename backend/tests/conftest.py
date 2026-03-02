"""Pytest fixtures for CyberBolt tests."""
import os
import tempfile
import pytest
from app import create_app


@pytest.fixture
def app():
    """Create test application with temp data directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        os.environ["DATA_DIR"] = tmpdir
        os.environ["FLASK_ENV"] = "testing"
        application = create_app("testing")
        application.config["DATA_DIR"] = tmpdir

        yield application

        # Cleanup repos cache
        from app.models import _repos
        _repos.clear()


@pytest.fixture
def client(app):
    """Flask test client."""
    return app.test_client()


@pytest.fixture
def auth_headers(client, app):
    """Get JWT auth headers for admin user."""
    with app.app_context():
        response = client.post("/api/v1/auth/login", json={
            "username": app.config["ADMIN_USERNAME"],
            "password": app.config["ADMIN_PASSWORD"],
        })
        if response.status_code == 200:
            token = response.get_json()["access_token"]
            return {"Authorization": f"Bearer {token}"}
    return {}
