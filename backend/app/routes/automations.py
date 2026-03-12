from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.automation import Automation, AutomationRun
from datetime import datetime

automations_bp = Blueprint('automations', __name__, url_prefix='/api/v1/automations')


@automations_bp.route('', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def list_automations():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    automations = Automation.query.order_by(Automation.created_at.desc()).all()
    return jsonify({'automations': [_serialize(a) for a in automations]}), 200


@automations_bp.route('', methods=['POST'])
@jwt_required()
def create_automation():
    data = request.get_json()
    uid = get_jwt_identity()
    a = Automation(
        name=data.get('name'),
        description=data.get('description'),
        trigger=data.get('trigger'),
        condition=data.get('condition'),
        action=data.get('action'),
        action_config=data.get('action_config'),
        is_enabled=data.get('is_enabled', True),
        created_by=uid
    )
    db.session.add(a)
    db.session.commit()
    return jsonify({'automation': _serialize(a)}), 201


@automations_bp.route('/<int:auto_id>', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_automation(auto_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    a = Automation.query.get_or_404(auto_id)
    runs = AutomationRun.query.filter_by(automation_id=auto_id)\
        .order_by(AutomationRun.ran_at.desc()).limit(20).all()
    return jsonify({
        'automation': _serialize(a),
        'runs': [_serialize_run(r) for r in runs]
    }), 200


@automations_bp.route('/<int:auto_id>', methods=['PUT', 'OPTIONS'])
@jwt_required(optional=True)
def update_automation(auto_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    a = Automation.query.get_or_404(auto_id)
    data = request.get_json()
    for field in ['name', 'description', 'trigger', 'condition', 'action', 'action_config', 'is_enabled']:
        if field in data:
            setattr(a, field, data[field])
    a.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'automation': _serialize(a)}), 200


@automations_bp.route('/<int:auto_id>', methods=['DELETE'])
@jwt_required()
def delete_automation(auto_id):
    a = Automation.query.get_or_404(auto_id)
    db.session.delete(a)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200


@automations_bp.route('/<int:auto_id>/toggle', methods=['PUT', 'OPTIONS'])
@jwt_required(optional=True)
def toggle_automation(auto_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    a = Automation.query.get_or_404(auto_id)
    a.is_enabled = not a.is_enabled
    db.session.commit()
    return jsonify({'is_enabled': a.is_enabled}), 200


@automations_bp.route('/<int:auto_id>/run', methods=['POST'])
@jwt_required()
def manual_run(auto_id):
    a = Automation.query.get_or_404(auto_id)
    # Simulate execution
    run = AutomationRun(
        automation_id=a.id,
        status='success',
        detail=f'Manually triggered: {a.action}'
    )
    a.run_count = (a.run_count or 0) + 1
    a.last_run_at = datetime.utcnow()
    db.session.add(run)
    db.session.commit()
    return jsonify({'message': 'Run complete', 'run': _serialize_run(run)}), 200


def _serialize(a: Automation) -> dict:
    return {
        'id': a.id,
        'name': a.name,
        'description': a.description,
        'trigger': a.trigger,
        'condition': a.condition,
        'action': a.action,
        'action_config': a.action_config,
        'is_enabled': a.is_enabled,
        'run_count': a.run_count or 0,
        'last_run_at': a.last_run_at.isoformat() if a.last_run_at else None,
        'created_at': a.created_at.isoformat() if a.created_at else None,
    }


def _serialize_run(r: AutomationRun) -> dict:
    return {
        'id': r.id,
        'automation_id': r.automation_id,
        'status': r.status,
        'detail': r.detail,
        'ran_at': r.ran_at.isoformat() if r.ran_at else None,
    }