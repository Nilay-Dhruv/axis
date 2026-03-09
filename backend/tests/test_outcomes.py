import pytest
from app.models.organization import Organization
from app.models.user import User
from app.models.department import Department
from app import db


@pytest.fixture
def setup(app):
    with app.app_context():
        org = Organization(name='Outcome Test Corp')
        db.session.add(org)
        db.session.flush()

        user = User(
            email='outcome@test.com',
            full_name='Outcome User',
            organization_id=org.id
        )
        user.set_password('TestPass1')
        db.session.add(user)
        db.session.flush()

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
    r = client.post('/api/v1/auth/login', json={
        'email': 'outcome@test.com',
        'password': 'TestPass1'
    })
    return r.get_json()['data']['access_token']


@pytest.fixture
def dept_id(setup):
    return str(setup['dept_id'])


class TestGetOutcomes:

    def test_unauthenticated(self, client):
        assert client.get('/api/v1/outcomes').status_code == 401

    def test_seeds_on_first_call(self, client, token):
        headers = {'Authorization': f'Bearer {token}'}
        r = client.get('/api/v1/outcomes', headers=headers)
        data = r.get_json()
        assert r.status_code == 200
        assert data['data']['total'] > 0

    def test_no_duplicate_seed(self, client, token):
        headers = {'Authorization': f'Bearer {token}'}
        client.get('/api/v1/outcomes', headers=headers)
        r = client.get('/api/v1/outcomes', headers=headers)
        first_total = r.get_json()['data']['total']
        r2 = client.get('/api/v1/outcomes', headers=headers)
        assert r2.get_json()['data']['total'] == first_total

    def test_filter_by_department(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        r = client.get(f'/api/v1/outcomes?department_id={dept_id}', headers=headers)
        assert r.status_code == 200
        assert r.get_json()['data']['total'] > 0

    def test_summary_endpoint(self, client, token):
        headers = {'Authorization': f'Bearer {token}'}
        client.get('/api/v1/outcomes', headers=headers)  # seed first
        r = client.get('/api/v1/outcomes/summary', headers=headers)
        data = r.get_json()
        assert r.status_code == 200
        assert 'total_outcomes' in data['data']['summary']
        assert 'total_signals' in data['data']['summary']

    def test_alerts_endpoint(self, client, token):
        headers = {'Authorization': f'Bearer {token}'}
        client.get('/api/v1/outcomes', headers=headers)
        r = client.get('/api/v1/outcomes/alerts', headers=headers)
        assert r.status_code == 200
        assert 'alerts' in r.get_json()['data']


class TestCreateOutcome:

    def test_create_outcome_success(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        r = client.post('/api/v1/outcomes', json={
            'name': 'Q4 Revenue Target',
            'description': 'Reach $500k revenue in Q4',
            'target_value': 500000,
            'current_value': 120000,
            'unit': 'USD',
            'department_id': dept_id,
        }, headers=headers)
        data = r.get_json()
        assert r.status_code == 201
        assert data['data']['outcome']['name'] == 'Q4 Revenue Target'
        assert data['data']['outcome']['unit'] == 'USD'

    def test_create_missing_name(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        r = client.post('/api/v1/outcomes', json={
            'department_id': dept_id,
            'target_value': 100,
        }, headers=headers)
        assert r.status_code == 422

    def test_create_missing_department(self, client, token):
        headers = {'Authorization': f'Bearer {token}'}
        r = client.post('/api/v1/outcomes', json={
            'name': 'No Department Outcome',
        }, headers=headers)
        assert r.status_code == 400


class TestUpdateOutcome:

    def test_update_current_value(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        create = client.post('/api/v1/outcomes', json={
            'name': 'Updatable Outcome',
            'target_value': 100.0,
            'current_value': 50.0,
            'unit': '%',
            'department_id': dept_id,
        }, headers=headers)
        out_id = create.get_json()['data']['outcome']['id']

        r = client.put(f'/api/v1/outcomes/{out_id}', json={
            'current_value': 100.0,
        }, headers=headers)
        data = r.get_json()
        assert r.status_code == 200
        assert data['data']['outcome']['status'] == 'achieved'

    def test_auto_at_risk_status(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        create = client.post('/api/v1/outcomes', json={
            'name': 'At Risk Outcome',
            'target_value': 100.0,
            'current_value': 40.0,
            'unit': '%',
            'department_id': dept_id,
        }, headers=headers)
        out_id = create.get_json()['data']['outcome']['id']

        r = client.put(f'/api/v1/outcomes/{out_id}', json={
            'current_value': 45.0,
        }, headers=headers)
        assert r.get_json()['data']['outcome']['status'] == 'at_risk'


class TestSignals:

    def test_create_signal(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        create = client.post('/api/v1/outcomes', json={
            'name': 'Signal Parent Outcome',
            'target_value': 100.0,
            'department_id': dept_id,
        }, headers=headers)
        out_id = create.get_json()['data']['outcome']['id']

        r = client.post(f'/api/v1/outcomes/{out_id}/signals', json={
            'name': 'Revenue Signal',
            'value': 75.0,
            'threshold_min': 60.0,
            'threshold_max': 110.0,
        }, headers=headers)
        data = r.get_json()
        assert r.status_code == 201
        assert data['data']['signal']['name'] == 'Revenue Signal'
        assert data['data']['signal']['status'] == 'normal'

    def test_signal_critical_below_min(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        create = client.post('/api/v1/outcomes', json={
            'name': 'Critical Signal Test',
            'target_value': 100.0,
            'department_id': dept_id,
        }, headers=headers)
        out_id = create.get_json()['data']['outcome']['id']

        r = client.post(f'/api/v1/outcomes/{out_id}/signals', json={
            'name': 'Below Min Signal',
            'value': 20.0,
            'threshold_min': 60.0,
        }, headers=headers)
        assert r.get_json()['data']['signal']['status'] == 'critical'

    def test_update_signal_value(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        create_out = client.post('/api/v1/outcomes', json={
            'name': 'Signal Update Outcome',
            'target_value': 100.0,
            'department_id': dept_id,
        }, headers=headers)
        out_id = create_out.get_json()['data']['outcome']['id']

        create_sig = client.post(f'/api/v1/outcomes/{out_id}/signals', json={
            'name': 'Updatable Signal',
            'value': 50.0,
            'threshold_min': 40.0,
        }, headers=headers)
        sig_id = create_sig.get_json()['data']['signal']['id']

        r = client.put(f'/api/v1/outcomes/{out_id}/signals/{sig_id}', json={
            'value': 30.0,
        }, headers=headers)
        assert r.get_json()['data']['signal']['status'] == 'critical'

    def test_delete_signal(self, client, token, dept_id):
        headers = {'Authorization': f'Bearer {token}'}
        create_out = client.post('/api/v1/outcomes', json={
            'name': 'Delete Signal Outcome',
            'target_value': 100.0,
            'department_id': dept_id,
        }, headers=headers)
        out_id = create_out.get_json()['data']['outcome']['id']

        create_sig = client.post(f'/api/v1/outcomes/{out_id}/signals', json={
            'name': 'To Be Deleted',
            'value': 50.0,
        }, headers=headers)
        sig_id = create_sig.get_json()['data']['signal']['id']

        r = client.delete(
            f'/api/v1/outcomes/{out_id}/signals/{sig_id}',
            headers=headers
        )
        assert r.status_code == 200