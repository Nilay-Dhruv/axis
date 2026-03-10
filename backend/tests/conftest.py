import pytest
from app import create_app, db as _db
from app.config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-jwt-secret'
    SECRET_KEY = 'test-secret'
    BCRYPT_LOG_ROUNDS = 4  # Faster hashing in tests

@pytest.fixture(scope='session')
def app():
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret-key-that-is-long-enough-32chars',
        'WTF_CSRF_ENABLED': False,
    })
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    with app.test_client() as c:
        with app.app_context():
            yield c

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