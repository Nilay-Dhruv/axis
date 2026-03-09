import pytest
from app.models.organization import Organization
from app.models.user import User
from app import db


@pytest.fixture
def org_and_user(app):
    """Create an org and user, return auth token"""
    with app.app_context():
        org = Organization(name='Test Corp')
        db.session.add(org)
        db.session.flush()

        user = User(
            email='dept@test.com',
            full_name='Dept User',
            organization_id=org.id
        )
        user.set_password('TestPass1')
        db.session.add(user)
        db.session.commit()

        return org.id, user.id


@pytest.fixture
def auth_token(client, org_and_user):
    """Login and return access token"""
    response = client.post('/api/v1/auth/login', json={
        'email': 'dept@test.com',
        'password': 'TestPass1'
    })
    return response.get_json()['data']['access_token']


class TestGetDepartments:

    def test_get_departments_unauthenticated(self, client):
        response = client.get('/api/v1/departments')
        assert response.status_code == 401

    def test_get_departments_seeds_defaults(self, client, auth_token):
        response = client.get(
            '/api/v1/departments',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        data = response.get_json()
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['total'] == 6
        names = [d['name'] for d in data['data']['departments']]
        assert 'Leadership' in names
        assert 'Finance' in names
        assert 'Sales' in names

    def test_get_departments_no_duplicate_seed(self, client, auth_token):
        headers = {'Authorization': f'Bearer {auth_token}'}
        # Call twice — should still be 6
        client.get('/api/v1/departments', headers=headers)
        response = client.get('/api/v1/departments', headers=headers)
        data = response.get_json()
        assert data['data']['total'] == 6


class TestGetDepartment:

    def test_get_single_department(self, client, auth_token):
        headers = {'Authorization': f'Bearer {auth_token}'}
        # Get all first
        all_resp = client.get('/api/v1/departments', headers=headers)
        dept_id = all_resp.get_json()['data']['departments'][0]['id']

        response = client.get(f'/api/v1/departments/{dept_id}', headers=headers)
        data = response.get_json()
        assert response.status_code == 200
        assert data['data']['department']['id'] == dept_id
        assert 'activities' in data['data']
        assert 'outcomes' in data['data']

    def test_get_nonexistent_department(self, client, auth_token):
        import uuid
        fake_id = str(uuid.uuid4())
        response = client.get(
            f'/api/v1/departments/{fake_id}',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        assert response.status_code == 404

    def test_get_department_invalid_id(self, client, auth_token):
        response = client.get(
            '/api/v1/departments/not-a-uuid',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        assert response.status_code == 400


class TestCreateDepartment:

    def test_create_department_free_tier_blocked(self, client, auth_token):
        """Free tier users cannot create custom departments"""
        response = client.post(
            '/api/v1/departments',
            json={'name': 'Custom Dept', 'type': 'custom'},
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        assert response.status_code == 403
        data = response.get_json()
        assert data['error']['code'] == 'TIER_REQUIRED'


class TestUpdateDepartment:

    def test_update_department_name(self, client, auth_token):
        headers = {'Authorization': f'Bearer {auth_token}'}
        all_resp = client.get('/api/v1/departments', headers=headers)
        dept_id = all_resp.get_json()['data']['departments'][0]['id']

        response = client.put(
            f'/api/v1/departments/{dept_id}',
            json={'name': 'Updated Name'},
            headers=headers
        )
        data = response.get_json()
        assert response.status_code == 200
        assert data['data']['department']['name'] == 'Updated Name'