import pytest
import json


class TestRegister:

    def test_register_success(self, client):
        response = client.post('/api/v1/auth/register', json={
            "email": "newuser@example.com",
            "password": "SecurePass1",
            "full_name": "New User",
            "organization_name": "My Company"
        })
        data = response.get_json()
        assert response.status_code == 201
        assert data['success'] is True
        assert data['data']['user']['email'] == 'newuser@example.com'
        assert 'password_hash' not in data['data']['user']

    def test_register_duplicate_email(self, client, registered_user):
        response = client.post('/api/v1/auth/register', json={
            "email": "test@example.com",
            "password": "AnotherPass1",
            "full_name": "Another User"
        })
        data = response.get_json()
        assert response.status_code == 409
        assert data['success'] is False

    def test_register_invalid_email(self, client):
        response = client.post('/api/v1/auth/register', json={
            "email": "not-an-email",
            "password": "SecurePass1",
            "full_name": "Test User"
        })
        assert response.status_code == 422

    def test_register_weak_password(self, client):
        response = client.post('/api/v1/auth/register', json={
            "email": "user@example.com",
            "password": "weak",
            "full_name": "Test User"
        })
        assert response.status_code == 422

    def test_register_missing_fields(self, client):
        response = client.post('/api/v1/auth/register', json={
            "email": "user@example.com"
        })
        assert response.status_code == 422


class TestLogin:

    def test_login_success(self, client, registered_user):
        response = client.post('/api/v1/auth/login', json={
            "email": "test@example.com",
            "password": "TestPass1"
        })
        data = response.get_json()
        assert response.status_code == 200
        assert data['success'] is True
        assert 'access_token' in data['data']
        assert 'refresh_token' in data['data']

    def test_login_wrong_password(self, client, registered_user):
        response = client.post('/api/v1/auth/login', json={
            "email": "test@example.com",
            "password": "WrongPass1"
        })
        data = response.get_json()
        assert response.status_code == 401
        assert data['success'] is False

    def test_login_nonexistent_email(self, client):
        response = client.post('/api/v1/auth/login', json={
            "email": "nobody@example.com",
            "password": "SomePass1"
        })
        assert response.status_code == 401

    def test_login_case_insensitive_email(self, client, registered_user):
        response = client.post('/api/v1/auth/login', json={
            "email": "TEST@EXAMPLE.COM",
            "password": "TestPass1"
        })
        assert response.status_code == 200


class TestProtectedRoutes:

    def test_get_me_authenticated(self, client, registered_user):
        # Login first
        login = client.post('/api/v1/auth/login', json={
            "email": "test@example.com",
            "password": "TestPass1"
        })
        token = login.get_json()['data']['access_token']

        # Access protected route
        response = client.get('/api/v1/auth/me', headers={
            "Authorization": f"Bearer {token}"
        })
        data = response.get_json()
        assert response.status_code == 200
        assert data['data']['user']['email'] == 'test@example.com'

    def test_get_me_unauthenticated(self, client):
        response = client.get('/api/v1/auth/me')
        assert response.status_code == 401

    def test_logout(self, client, registered_user):
        login = client.post('/api/v1/auth/login', json={
            "email": "test@example.com",
            "password": "TestPass1"
        })
        token = login.get_json()['data']['access_token']

        response = client.post('/api/v1/auth/logout', headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200

    def test_refresh_token(self, client, registered_user):
        login = client.post('/api/v1/auth/login', json={
            "email": "test@example.com",
            "password": "TestPass1"
        })
        refresh_token = login.get_json()['data']['refresh_token']

        response = client.post('/api/v1/auth/refresh', headers={
            "Authorization": f"Bearer {refresh_token}"
        })
        data = response.get_json()
        assert response.status_code == 200
        assert 'access_token' in data['data']