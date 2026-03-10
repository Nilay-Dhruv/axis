"""Tests for profile, password change, and dashboard summary endpoints."""
import pytest
import json


# ─── Helpers ─────────────────────────────────────────────────────────────────

def register_and_login(client, email="test_settings@axis.com", password="Password123"):
    client.post('/api/v1/auth/register', json={
        'full_name': 'Settings Tester',
        'email': email,
        'password': password,
    })
    res = client.post('/api/v1/auth/login', json={'email': email, 'password': password})
    data = json.loads(res.data)
    return data['data']['tokens']['access_token']


def auth_headers(token):
    return {'Authorization': f'Bearer {token}'}


# ─── GET /auth/profile ────────────────────────────────────────────────────────

class TestGetProfile:

    def test_get_profile_success(self, client):
        token = register_and_login(client, 'profile_get@axis.com')
        res = client.get('/api/v1/auth/profile', headers=auth_headers(token))
        assert res.status_code == 200
        data = json.loads(res.data)
        assert data['success'] is True
        user = data['data']['user']
        assert user['email'] == 'profile_get@axis.com'
        assert user['full_name'] == 'Settings Tester'
        assert 'password_hash' not in user

    def test_get_profile_requires_auth(self, client):
        res = client.get('/api/v1/auth/profile')
        assert res.status_code == 401


# ─── PUT /auth/profile ────────────────────────────────────────────────────────

class TestUpdateProfile:

    def test_update_name_success(self, client):
        token = register_and_login(client, 'profile_put@axis.com')
        res = client.put(
            '/api/v1/auth/profile',
            json={'full_name': 'Updated Name'},
            headers=auth_headers(token),
        )
        assert res.status_code == 200
        data = json.loads(res.data)
        assert data['data']['full_name'] == 'Updated Name'

    def test_update_name_too_short(self, client):
        token = register_and_login(client, 'profile_short@axis.com')
        res = client.put(
            '/api/v1/auth/profile',
            json={'full_name': 'X'},
            headers=auth_headers(token),
        )
        assert res.status_code == 422

    def test_update_name_empty(self, client):
        token = register_and_login(client, 'profile_empty@axis.com')
        res = client.put(
            '/api/v1/auth/profile',
            json={'full_name': ''},
            headers=auth_headers(token),
        )
        assert res.status_code == 422

    def test_update_requires_auth(self, client):
        res = client.put('/api/v1/auth/profile', json={'full_name': 'No Auth'})
        assert res.status_code == 401


# ─── POST /auth/change-password ───────────────────────────────────────────────

class TestChangePassword:

    def test_change_password_success(self, client):
        token = register_and_login(client, 'pw_change@axis.com', 'OldPass123')
        res = client.post(
            '/api/v1/auth/change-password',
            json={
                'current_password': 'OldPass123',
                'new_password':     'NewPass456',
                'confirm_password': 'NewPass456',
            },
            headers=auth_headers(token),
        )
        assert res.status_code == 200
        data = json.loads(res.data)
        assert data['success'] is True

    def test_wrong_current_password(self, client):
        token = register_and_login(client, 'pw_wrong@axis.com', 'OldPass123')
        res = client.post(
            '/api/v1/auth/change-password',
            json={
                'current_password': 'WrongPass',
                'new_password':     'NewPass456',
                'confirm_password': 'NewPass456',
            },
            headers=auth_headers(token),
        )
        assert res.status_code == 400
        data = json.loads(res.data)
        assert data['error']['code'] == 'INVALID_PASSWORD'

    def test_passwords_dont_match(self, client):
        token = register_and_login(client, 'pw_mismatch@axis.com', 'OldPass123')
        res = client.post(
            '/api/v1/auth/change-password',
            json={
                'current_password': 'OldPass123',
                'new_password':     'NewPass456',
                'confirm_password': 'NewPass789',
            },
            headers=auth_headers(token),
        )
        assert res.status_code == 422

    def test_new_password_too_short(self, client):
        token = register_and_login(client, 'pw_short@axis.com', 'OldPass123')
        res = client.post(
            '/api/v1/auth/change-password',
            json={
                'current_password': 'OldPass123',
                'new_password':     'abc',
                'confirm_password': 'abc',
            },
            headers=auth_headers(token),
        )
        assert res.status_code == 422

    def test_same_as_current(self, client):
        token = register_and_login(client, 'pw_same@axis.com', 'OldPass123')
        res = client.post(
            '/api/v1/auth/change-password',
            json={
                'current_password': 'OldPass123',
                'new_password':     'OldPass123',
                'confirm_password': 'OldPass123',
            },
            headers=auth_headers(token),
        )
        assert res.status_code == 422

    def test_requires_auth(self, client):
        res = client.post('/api/v1/auth/change-password', json={
            'current_password': 'x', 'new_password': 'y', 'confirm_password': 'y',
        })
        assert res.status_code == 401


# ─── GET /auth/dashboard/summary ─────────────────────────────────────────────

class TestDashboardSummary:

    def test_summary_success(self, client):
        token = register_and_login(client, 'dash_summary@axis.com')
        res = client.get(
            '/api/v1/auth/dashboard/summary',
            headers=auth_headers(token),
        )
        assert res.status_code == 200
        data = json.loads(res.data)
        assert data['success'] is True
        summary = data['data']
        assert 'departments' in summary
        assert 'outcomes'    in summary
        assert 'signals'     in summary
        assert 'recent_activity' in summary

    def test_summary_structure(self, client):
        token = register_and_login(client, 'dash_struct@axis.com')
        res = client.get(
            '/api/v1/auth/dashboard/summary',
            headers=auth_headers(token),
        )
        data = json.loads(res.data)['data']
        # Departments
        assert 'total' in data['departments']
        # Outcomes
        for key in ('total', 'achieved', 'at_risk', 'avg_progress'):
            assert key in data['outcomes']
        # Signals
        for key in ('total', 'critical', 'warning', 'normal'):
            assert key in data['signals']
        # Recent activity is a list
        assert isinstance(data['recent_activity'], list)

    def test_summary_requires_auth(self, client):
        res = client.get('/api/v1/auth/dashboard/summary')
        assert res.status_code == 401

    def test_summary_counts_are_non_negative(self, client):
        token = register_and_login(client, 'dash_nonneg@axis.com')
        res = client.get(
            '/api/v1/auth/dashboard/summary',
            headers=auth_headers(token),
        )
        data = json.loads(res.data)['data']
        assert data['departments']['total'] >= 0
        assert data['outcomes']['total']    >= 0
        assert data['signals']['total']     >= 0
        assert 0.0 <= data['outcomes']['avg_progress'] <= 100.0