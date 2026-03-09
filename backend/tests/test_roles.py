import pytest
from app.models.organization import Organization
from app.models.user import User
from app import db


@pytest.fixture
def setup(app):
    with app.app_context():
        org = Organization(name='Roles Test Corp')
        db.session.add(org)
        db.session.flush()

        # Admin user (premium)
        admin = User(
            email='admin@roles.test',
            full_name='Admin User',
            organization_id=org.id,
            subscription_tier='premium',
        )
        admin.set_password('TestPass1')
        db.session.add(admin)

        # Free user
        free_user = User(
            email='free@roles.test',
            full_name='Free User',
            organization_id=org.id,
            subscription_tier='free',
        )
        free_user.set_password('TestPass1')
        db.session.add(free_user)
        db.session.flush()

        db.session.commit()
        return {
            'org_id':      org.id,
            'admin_id':    admin.id,
            'free_user_id': free_user.id,
        }


@pytest.fixture
def admin_token(client, setup):
    r = client.post('/api/v1/auth/login', json={
        'email':    'admin@roles.test',
        'password': 'TestPass1',
    })
    return r.get_json()['data']['access_token']


@pytest.fixture
def free_token(client, setup):
    r = client.post('/api/v1/auth/login', json={
        'email':    'free@roles.test',
        'password': 'TestPass1',
    })
    return r.get_json()['data']['access_token']


@pytest.fixture
def free_user_id(setup):
    return str(setup['free_user_id'])


class TestGetRoles:

    def test_unauthenticated(self, client):
        assert client.get('/api/v1/roles').status_code == 401

    def test_seeds_on_first_call(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        r = client.get('/api/v1/roles', headers=headers)
        data = r.get_json()
        assert r.status_code == 200
        assert data['data']['total'] == 4
        names = [role['name'] for role in data['data']['roles']]
        assert 'Viewer'  in names
        assert 'Editor'  in names
        assert 'Manager' in names
        assert 'Admin'   in names

    def test_no_duplicate_seed(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        client.get('/api/v1/roles', headers=headers)
        r = client.get('/api/v1/roles', headers=headers)
        assert r.get_json()['data']['total'] == 4

    def test_get_permissions_matrix(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        r = client.get('/api/v1/roles/permissions', headers=headers)
        data = r.get_json()
        assert r.status_code == 200
        assert 'Departments' in data['data']['matrix']
        assert 'Activities'  in data['data']['matrix']
        assert data['data']['total'] > 20

    def test_get_my_permissions_no_roles(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        r = client.get('/api/v1/roles/my-permissions', headers=headers)
        data = r.get_json()
        assert r.status_code == 200
        assert 'permissions' in data['data']


class TestCreateRole:

    def test_free_user_cannot_create(self, client, free_token):
        headers = {'Authorization': f'Bearer {free_token}'}
        r = client.post('/api/v1/roles', json={
            'name':        'Custom Role',
            'permissions': ['activities.view'],
        }, headers=headers)
        assert r.status_code == 403
        assert r.get_json()['error']['code'] == 'TIER_REQUIRED'

    def test_admin_can_create(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        r = client.post('/api/v1/roles', json={
            'name':        'Custom Analyst',
            'description': 'Read and analyze data',
            'permissions': ['analytics.view', 'outcomes.view', 'signals.view'],
        }, headers=headers)
        data = r.get_json()
        assert r.status_code == 201
        assert data['data']['role']['name'] == 'Custom Analyst'
        assert data['data']['role']['is_system'] is False
        assert 'analytics.view' in data['data']['role']['permissions']

    def test_invalid_permission(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        r = client.post('/api/v1/roles', json={
            'name':        'Bad Role',
            'permissions': ['invalid.permission.xyz'],
        }, headers=headers)
        assert r.status_code == 422

    def test_duplicate_name(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        client.post('/api/v1/roles', json={
            'name': 'Unique Role',
            'permissions': [],
        }, headers=headers)
        r = client.post('/api/v1/roles', json={
            'name': 'Unique Role',
            'permissions': [],
        }, headers=headers)
        assert r.status_code == 409


class TestUpdateRole:

    def test_cannot_update_system_role(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        # Get Viewer role id
        roles_r = client.get('/api/v1/roles', headers=headers)
        viewer = next(
            r for r in roles_r.get_json()['data']['roles']
            if r['name'] == 'Viewer'
        )
        r = client.put(f'/api/v1/roles/{viewer["id"]}', json={
            'name': 'Hacked Viewer',
        }, headers=headers)
        assert r.status_code == 403
        assert r.get_json()['error']['code'] == 'SYSTEM_ROLE'

    def test_update_custom_role(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        create = client.post('/api/v1/roles', json={
            'name':        'Updatable Role',
            'permissions': ['analytics.view'],
        }, headers=headers)
        role_id = create.get_json()['data']['role']['id']

        r = client.put(f'/api/v1/roles/{role_id}', json={
            'name':        'Updated Role Name',
            'permissions': ['analytics.view', 'outcomes.view'],
        }, headers=headers)
        data = r.get_json()
        assert r.status_code == 200
        assert data['data']['role']['name'] == 'Updated Role Name'
        assert 'outcomes.view' in data['data']['role']['permissions']


class TestDeleteRole:

    def test_cannot_delete_system_role(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        roles_r = client.get('/api/v1/roles', headers=headers)
        admin_role = next(
            r for r in roles_r.get_json()['data']['roles']
            if r['name'] == 'Admin'
        )
        r = client.delete(f'/api/v1/roles/{admin_role["id"]}', headers=headers)
        assert r.status_code == 403

    def test_delete_custom_role(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        create = client.post('/api/v1/roles', json={
            'name': 'Delete Me',
            'permissions': [],
        }, headers=headers)
        role_id = create.get_json()['data']['role']['id']

        r = client.delete(f'/api/v1/roles/{role_id}', headers=headers)
        assert r.status_code == 200

        # Confirm gone
        r2 = client.get(f'/api/v1/roles/{role_id}', headers=headers)
        assert r2.status_code == 404


class TestAssignRevoke:

    def test_assign_role_to_user(self, client, admin_token, free_user_id):
        headers = {'Authorization': f'Bearer {admin_token}'}
        roles_r = client.get('/api/v1/roles', headers=headers)
        editor = next(
            r for r in roles_r.get_json()['data']['roles']
            if r['name'] == 'Editor'
        )

        r = client.post(f'/api/v1/roles/{editor["id"]}/assign', json={
            'user_id': free_user_id,
        }, headers=headers)
        data = r.get_json()
        assert r.status_code == 201
        assert data['data']['assignment']['user_id'] == free_user_id
        assert data['data']['assignment']['role']['name'] == 'Editor'

    def test_idempotent_assign(self, client, admin_token, free_user_id):
        headers = {'Authorization': f'Bearer {admin_token}'}
        roles_r = client.get('/api/v1/roles', headers=headers)
        viewer = next(
            r for r in roles_r.get_json()['data']['roles']
            if r['name'] == 'Viewer'
        )
        client.post(f'/api/v1/roles/{viewer["id"]}/assign', json={
            'user_id': free_user_id,
        }, headers=headers)
        r = client.post(f'/api/v1/roles/{viewer["id"]}/assign', json={
            'user_id': free_user_id,
        }, headers=headers)
        # Second assign should still succeed (idempotent)
        assert r.status_code == 201

    def test_free_user_cannot_assign(self, client, free_token, free_user_id):
        headers = {'Authorization': f'Bearer {free_token}'}
        r = client.post(f'/api/v1/roles/{free_user_id}/assign', json={
            'user_id': free_user_id,
        }, headers=headers)
        assert r.status_code == 403

    def test_revoke_role(self, client, admin_token, free_user_id):
        headers = {'Authorization': f'Bearer {admin_token}'}
        roles_r = client.get('/api/v1/roles', headers=headers)
        viewer = next(
            r for r in roles_r.get_json()['data']['roles']
            if r['name'] == 'Viewer'
        )
        client.post(f'/api/v1/roles/{viewer["id"]}/assign', json={
            'user_id': free_user_id,
        }, headers=headers)

        r = client.post(f'/api/v1/roles/{viewer["id"]}/revoke', json={
            'user_id': free_user_id,
        }, headers=headers)
        assert r.status_code == 200

    def test_revoke_nonexistent_assignment(self, client, admin_token, free_user_id):
        headers = {'Authorization': f'Bearer {admin_token}'}
        roles_r = client.get('/api/v1/roles', headers=headers)
        manager = next(
            r for r in roles_r.get_json()['data']['roles']
            if r['name'] == 'Manager'
        )
        r = client.post(f'/api/v1/roles/{manager["id"]}/revoke', json={
            'user_id': free_user_id,
        }, headers=headers)
        assert r.status_code == 404


class TestPermissionCheck:

    def test_check_valid_permission(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        r = client.post('/api/v1/roles/check', json={
            'permission': 'analytics.view',
        }, headers=headers)
        data = r.get_json()
        assert r.status_code == 200
        assert 'granted' in data['data']

    def test_check_invalid_permission(self, client, admin_token):
        headers = {'Authorization': f'Bearer {admin_token}'}
        r = client.post('/api/v1/roles/check', json={
            'permission': 'nonexistent.perm',
        }, headers=headers)
        assert r.status_code == 400
        assert r.get_json()['error']['code'] == 'INVALID_PERMISSION'