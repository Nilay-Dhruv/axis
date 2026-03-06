import pytest
from app import create_app, db
from app.config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-jwt-secret'
    SECRET_KEY = 'test-secret'
    BCRYPT_LOG_ROUNDS = 4  # Faster hashing in tests

@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def registered_user(client):
    """Helper: Register a user and return their data"""
    response = client.post('/api/v1/auth/register', json={
        "email": "test@example.com",
        "password": "TestPass1",
        "full_name": "Test User",
        "organization_name": "Test Org"
    })
    return response.get_json()