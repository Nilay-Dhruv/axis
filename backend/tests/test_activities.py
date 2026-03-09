import pytest
from app.models.organization import Organization
from app.models.user import User
from app.models.department import Department
from app import db


@pytest.fixture
def setup(app):
    with app.app_context():
        org = Organization(name='Activity Test Corp')
        db.session.add(org)
        db.session.flush()

        user = User(
            email='activity@test.com',
            full_name='Activity User',
            organization_id=org.id
        )
        user.set_password('TestPass1')
        db.session.add(user)
        db.session.flush()

        # Create one department
        dept = Department(
            organization_id=org.id,
            owner_id=user.id,
            name='Finance',
            type='finance',
            is_default=True,
            config={'icon': '◈', 'color': '#00cc88'}
        )
        db.session.add(dept)
        db.session.commit()

        return {'org_id': org.id, 'user_id': user.id, 'dept_id': dept.id}


@pytest.fixture
def token(client, setup):
    response = client.post('/api/v1/auth/login', json={
        'email': 'activity@test.com',
        'password': 'TestPass1'
    })
    return response.get_json()['data']['access_token']


@pytest.fixture
def dept_id(client, setup):
    return str(setup['dept_id'])


class TestGetActivities:

    def test_unauthenticated(self, client):
        response = client.get('/api/v1/activities')
        assert response.status_code == 401

    def test_get_all_activities_seeds_on_empty(self, client, token):
        headers = {'Authorization': f'Bearer {token}'}
        response = client.get('/api/v1/activities', headers=headers)
        data = response.get_json()
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['total'] > 0

    def test_filter_by_department(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        response = client.get(
            f'/api/v1/activities?department_id={dept_id}',
            headers=headers
        )
        data = response.get_json()
        assert response.status_code == 200
        assert data['data']['total'] > 0

    def test_filter_invalid_department(self, client, token):
        headers = {'Authorization': f'Bearer {token}'}
        response = client.get(
            '/api/v1/activities?department_id=not-a-uuid',
            headers=headers
        )
        assert response.status_code == 400


class TestCreateActivity:

    def test_create_activity_success(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        response = client.post('/api/v1/activities', json={
            'name': 'Custom Budget Review',
            'type': 'review',
            'description': 'Monthly budget review activity',
            'department_id': dept_id,
            'tier_required': 'free',
        }, headers=headers)
        data = response.get_json()
        assert response.status_code == 201
        assert data['success'] is True
        assert data['data']['activity']['name'] == 'Custom Budget Review'

    def test_create_activity_missing_name(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        response = client.post('/api/v1/activities', json={
            'type': 'review',
            'department_id': dept_id,
        }, headers=headers)
        assert response.status_code == 422

    def test_create_activity_invalid_type(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        response = client.post('/api/v1/activities', json={
            'name': 'Test',
            'type': 'invalid_type',
            'department_id': dept_id,
        }, headers=headers)
        assert response.status_code == 422

    def test_create_activity_missing_department(self, client, token):
        headers = {'Authorization': f'Bearer {token}'}
        response = client.post('/api/v1/activities', json={
            'name': 'Test Activity',
            'type': 'review',
        }, headers=headers)
        assert response.status_code == 400


class TestUpdateActivity:

    def test_update_activity_name(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}

        # Create first
        create = client.post('/api/v1/activities', json={
            'name': 'Original Name',
            'type': 'track',
            'department_id': dept_id,
        }, headers=headers)
        act_id = create.get_json()['data']['activity']['id']

        # Update
        response = client.put(
            f'/api/v1/activities/{act_id}',
            json={'name': 'Updated Name'},
            headers=headers
        )
        data = response.get_json()
        assert response.status_code == 200
        assert data['data']['activity']['name'] == 'Updated Name'


class TestExecuteActivity:

    def test_execute_activity_success(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}

        # Create a free-tier activity
        create = client.post('/api/v1/activities', json={
            'name': 'Execute Me',
            'type': 'execute',
            'department_id': dept_id,
            'tier_required': 'free',
        }, headers=headers)
        act_id = create.get_json()['data']['activity']['id']

        # Execute
        response = client.post(
            f'/api/v1/activities/{act_id}/execute',
            json={'notes': 'Executed in test', 'data': {'result': 'success'}},
            headers=headers
        )
        data = response.get_json()
        assert response.status_code == 201
        assert data['success'] is True
        assert data['data']['log']['status'] == 'completed'
        assert data['data']['log']['notes'] == 'Executed in test'

    def test_execute_nonexistent_activity(self, client, token):
        import uuid
        headers = {'Authorization': f'Bearer {token}'}
        response = client.post(
            f'/api/v1/activities/{uuid.uuid4()}/execute',
            json={},
            headers=headers
        )
        assert response.status_code == 404

    def test_execute_premium_activity_as_free(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}

        # Create premium activity
        create = client.post('/api/v1/activities', json={
            'name': 'Premium Activity',
            'type': 'report',
            'department_id': dept_id,
            'tier_required': 'premium',
        }, headers=headers)
        act_id = create.get_json()['data']['activity']['id']

        response = client.post(
            f'/api/v1/activities/{act_id}/execute',
            json={},
            headers=headers
        )
        assert response.status_code == 403
        assert response.get_json()['error']['code'] == 'TIER_REQUIRED'


class TestRecentLogs:

    def test_get_recent_logs(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}

        # Execute one activity first
        create = client.post('/api/v1/activities', json={
            'name': 'Log Test Activity',
            'type': 'track',
            'department_id': dept_id,
            'tier_required': 'free',
        }, headers=headers)
        act_id = create.get_json()['data']['activity']['id']
        client.post(f'/api/v1/activities/{act_id}/execute', json={}, headers=headers)

        response = client.get('/api/v1/activities/recent-logs', headers=headers)
        data = response.get_json()
        assert response.status_code == 200
        assert data['data']['total'] >= 1