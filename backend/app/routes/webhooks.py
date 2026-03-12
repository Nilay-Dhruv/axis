from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.webhook import Webhook, WebhookDelivery
import secrets

webhooks_bp = Blueprint('webhooks', __name__, url_prefix='/api/v1/webhooks')

AVAILABLE_EVENTS = ['signal_critical', 'outcome_at_risk', 'outcome_completed', 'activity_created', 'automation_triggered']


@webhooks_bp.route('', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def list_webhooks():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    wh = Webhook.query.order_by(Webhook.created_at.desc()).all()
    return jsonify({'webhooks': [_serialize(w) for w in wh], 'available_events': AVAILABLE_EVENTS}), 200


@webhooks_bp.route('', methods=['POST'])
@jwt_required()
def create_webhook():
    data = request.get_json()
    uid = get_jwt_identity()
    w = Webhook(
        name=data.get('name'),
        url=data.get('url'),
        events=data.get('events', []),
        secret=secrets.token_hex(16),
        is_active=data.get('is_active', True),
        created_by=uid
    )
    db.session.add(w)
    db.session.commit()
    return jsonify({'webhook': _serialize(w)}), 201


@webhooks_bp.route('/<int:wh_id>', methods=['DELETE'])
@jwt_required()
def delete_webhook(wh_id):
    w = Webhook.query.get_or_404(wh_id)
    db.session.delete(w)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200


@webhooks_bp.route('/<int:wh_id>/toggle', methods=['PUT', 'OPTIONS'])
@jwt_required(optional=True)
def toggle_webhook(wh_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    w = Webhook.query.get_or_404(wh_id)
    w.is_active = not w.is_active
    db.session.commit()
    return jsonify({'is_active': w.is_active}), 200


@webhooks_bp.route('/<int:wh_id>/test', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def test_webhook(wh_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    import requests as req_lib
    w = Webhook.query.get_or_404(wh_id)
    payload = {'event': 'test', 'message': 'AXIS webhook test', 'webhook_id': w.id}
    success, status_code, error = False, None, None
    try:
        r = req_lib.post(w.url, json=payload, timeout=5)
        status_code = r.status_code
        success = r.status_code < 400
    except Exception as e:
        error = str(e)
    delivery = WebhookDelivery(webhook_id=w.id, event='test', payload=payload,
                               status_code=status_code, success=success, error=error)
    db.session.add(delivery)
    db.session.commit()
    return jsonify({'success': success, 'status_code': status_code, 'error': error}), 200


@webhooks_bp.route('/<int:wh_id>/deliveries', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_deliveries(wh_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    deliveries = WebhookDelivery.query.filter_by(webhook_id=wh_id)\
        .order_by(WebhookDelivery.delivered_at.desc()).limit(20).all()
    return jsonify({'deliveries': [
        {'id': d.id, 'event': d.event, 'success': d.success,
         'status_code': d.status_code, 'error': d.error,
         'delivered_at': d.delivered_at.isoformat() if d.delivered_at else None}
        for d in deliveries
    ]}), 200


def _serialize(w: Webhook) -> dict:
    return {
        'id': w.id, 'name': w.name, 'url': w.url, 'events': w.events,
        'secret': w.secret, 'is_active': w.is_active,
        'delivery_count': len(w.deliveries),
        'created_at': w.created_at.isoformat() if w.created_at else None,
    }