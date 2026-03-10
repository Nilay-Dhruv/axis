from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required
from app.models.department import Department
from app.models.outcome import Outcome
from marshmallow import ValidationError
from app.schemas.outcome_schema import (
    OutcomeCreateSchema, OutcomeUpdateSchema,
    SignalCreateSchema, SignalUpdateSchema
)
from app.services.outcome_service import OutcomeService, SignalService
from app.services.department_service import DepartmentService
from app.middleware.auth_middleware import jwt_required_custom
import uuid
from app.models.signal import Signal
from app.models.department import Department

outcomes_bp = Blueprint('outcomes', __name__)

outcome_create_schema = OutcomeCreateSchema()
outcome_update_schema = OutcomeUpdateSchema()
signal_create_schema  = SignalCreateSchema()
signal_update_schema  = SignalUpdateSchema()


# ── Outcomes ───────────────────────────────────────────────────────────────

@outcomes_bp.route('', methods=['GET'])
@jwt_required_custom
def get_outcomes():
    user = g.current_user
    department_id = request.args.get('department_id')

    if department_id:
        try:
            dept_uuid = uuid.UUID(department_id)
        except ValueError:
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_ID', 'message': 'Invalid department ID'}
            }), 400

        dept = DepartmentService.get_by_id(dept_uuid, user.organization_id)
        if not dept:
            return jsonify({
                'success': False,
                'error': {'code': 'NOT_FOUND', 'message': 'Department not found'}
            }), 404

        outcomes = OutcomeService.get_all(department_id=dept_uuid)
        if not outcomes:
            OutcomeService.seed_outcomes_for_department(dept)
            outcomes = OutcomeService.get_all(department_id=dept_uuid)
    else:
        outcomes = OutcomeService.get_all(organization_id=user.organization_id)
        if not outcomes:
            OutcomeService.seed_all_departments(user.organization_id)
            outcomes = OutcomeService.get_all(organization_id=user.organization_id)

    return jsonify({
        'success': True,
        'data': {
            'outcomes': [o.to_dict() for o in outcomes],
            'total': len(outcomes),
        },
        'message': 'Outcomes retrieved successfully'
    }), 200


@outcomes_bp.route('/summary', methods=['GET'])
@jwt_required_custom
def get_summary():
    user = g.current_user
    summary = OutcomeService.get_summary(user.organization_id)
    return jsonify({
        'success': True,
        'data': {'summary': summary},
        'message': 'Summary retrieved'
    }), 200


@outcomes_bp.route('/alerts', methods=['GET'])
@jwt_required_custom
def get_alerts():
    user = g.current_user
    alerts = OutcomeService.get_alerts(user.organization_id)
    return jsonify({
        'success': True,
        'data': {
            'alerts': [s.to_dict() for s in alerts],
            'total': len(alerts),
        },
        'message': 'Alerts retrieved'
    }), 200


@outcomes_bp.route('/<outcome_id>', methods=['GET'])
@jwt_required_custom
def get_outcome(outcome_id: str):
    user = g.current_user

    try:
        out_uuid = uuid.UUID(outcome_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid outcome ID'}
        }), 400

    outcome = OutcomeService.get_by_id(out_uuid)
    if not outcome:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Outcome not found'}
        }), 404

    dept = DepartmentService.get_by_id(outcome.department_id, user.organization_id)
    if not dept:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}
        }), 403

    signals = OutcomeService.get_signals(out_uuid)

    return jsonify({
        'success': True,
        'data': {
            'outcome': outcome.to_dict(),
            'signals': [s.to_dict() for s in signals],
        },
        'message': 'Outcome retrieved successfully'
    }), 200


@outcomes_bp.route('', methods=['POST'])
@jwt_required_custom
def create_outcome():
    user = g.current_user
    body = request.get_json() or {}

    department_id = body.get('department_id')
    if not department_id:
        return jsonify({
            'success': False,
            'error': {'code': 'MISSING_FIELD', 'message': 'department_id is required'}
        }), 400

    try:
        dept_uuid = uuid.UUID(department_id)
        data = outcome_create_schema.load(body)
    except (ValueError, ValidationError) as err:
        msg = err.messages if hasattr(err, 'messages') else 'Invalid department ID'
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': 'Invalid input', 'details': msg}
        }), 422

    dept = DepartmentService.get_by_id(dept_uuid, user.organization_id)
    if not dept:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Department not found'}
        }), 404

    outcome = OutcomeService.create(
        department_id=dept_uuid,
        owner_id=user.id,
        name=data['name'],
        description=data.get('description'),
        target_value=data.get('target_value'),
        current_value=data.get('current_value'),
        unit=data.get('unit'),
        status=data.get('status', 'active'),
    )

    return jsonify({
        'success': True,
        'data': {'outcome': outcome.to_dict()},
        'message': 'Outcome created successfully'
    }), 201


@outcomes_bp.route('/<outcome_id>', methods=['PUT'])
@jwt_required_custom
def update_outcome(outcome_id: str):
    user = g.current_user

    try:
        out_uuid = uuid.UUID(outcome_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid outcome ID'}
        }), 400

    outcome = OutcomeService.get_by_id(out_uuid)
    if not outcome:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Outcome not found'}
        }), 404

    dept = DepartmentService.get_by_id(outcome.department_id, user.organization_id)
    if not dept:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}
        }), 403

    try:
        data = outcome_update_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': 'Invalid input', 'details': err.messages}
        }), 422

    outcome = OutcomeService.update(outcome, data)

    return jsonify({
        'success': True,
        'data': {'outcome': outcome.to_dict()},
        'message': 'Outcome updated successfully'
    }), 200


@outcomes_bp.route('/<outcome_id>', methods=['DELETE'])
@jwt_required_custom
def delete_outcome(outcome_id: str):
    user = g.current_user

    try:
        out_uuid = uuid.UUID(outcome_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid outcome ID'}
        }), 400

    outcome = OutcomeService.get_by_id(out_uuid)
    if not outcome:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Outcome not found'}
        }), 404

    dept = DepartmentService.get_by_id(outcome.department_id, user.organization_id)
    if not dept:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}
        }), 403

    OutcomeService.delete(outcome)

    return jsonify({
        'success': True,
        'data': {},
        'message': 'Outcome deleted successfully'
    }), 200



@outcomes_bp.route("/<outcome_id>/detail", methods=["GET", "OPTIONS"])
@jwt_required(optional=True)
def outcome_detail(outcome_id):

    # Allow CORS preflight
    if request.method == "OPTIONS":
        return jsonify({}), 200

    outcome = Outcome.query.filter_by(id=outcome_id).first()

    if not outcome:
        return jsonify({"error": "Outcome not found"}), 404

    department = Department.query.get(outcome.department_id)

    # calculate progress safely
    progress = 0
    if outcome.target_value and outcome.current_value:
        progress = round(
            (float(outcome.current_value) / float(outcome.target_value)) * 100,
            2
        )

    # generate fake progress history (30 days)
    today = datetime.utcnow()
    progress_history = []

    for i in range(29, -1, -1):
        day = today - timedelta(days=i)

        progress_history.append({
            "date": day.strftime("%b %d"),
            "progress": max(0, min(100, progress + (i % 5 - 2) * 2))
        })

    # linked signals
    signals = Signal.query.filter_by(outcome_id=outcome.id).all()

    linked_signals = []

    for s in signals:
        linked_signals.append({
            "id": str(s.id),
            "name": s.name,
            "status": s.status,
            "value": float(s.value) if s.value else None,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })

    return jsonify({
        "outcome": {
            "id": str(outcome.id),
            "name": outcome.name,
            "description": outcome.description,
            "status": outcome.status,
            "department": department.name if department else None,
            "progress": progress,
            "created_at": outcome.created_at.isoformat() if outcome.created_at else None
        },
        "progress_history": progress_history,
        "linked_signals": linked_signals
    }), 200