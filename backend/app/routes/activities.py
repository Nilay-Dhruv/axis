from flask import Blueprint, request, jsonify, g
from marshmallow import ValidationError
from app.schemas.activity_schema import (
    ActivityCreateSchema,
    ActivityUpdateSchema,
    ActivityExecuteSchema
)
from app.services.activity_service import ActivityService
from app.services.department_service import DepartmentService
from app.middleware.auth_middleware import jwt_required_custom, tier_required
import uuid

activities_bp = Blueprint('activities', __name__)

create_schema  = ActivityCreateSchema()
update_schema  = ActivityUpdateSchema()
execute_schema = ActivityExecuteSchema()

TIER_HIERARCHY = {'free': 0, 'basic_premium': 1, 'premium': 2}


def _check_activity_tier(activity, user):
    """Check if user's tier can access the activity"""
    user_level     = TIER_HIERARCHY.get(user.subscription_tier, 0)
    required_level = TIER_HIERARCHY.get(activity.tier_required, 0)
    return user_level >= required_level


@activities_bp.route('', methods=['GET'])
@jwt_required_custom
def get_activities():
    """Get activities — optionally filter by department_id"""
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

        # Verify department belongs to user's org
        dept = DepartmentService.get_by_id(dept_uuid, user.organization_id)
        if not dept:
            return jsonify({
                'success': False,
                'error': {'code': 'NOT_FOUND', 'message': 'Department not found'}
            }), 404

        # Auto-seed if no activities
        activities = ActivityService.get_all(department_id=dept_uuid)
        if not activities:
            ActivityService.seed_activities_for_department(dept)
            activities = ActivityService.get_all(department_id=dept_uuid)
    else:
        activities = ActivityService.get_all(organization_id=user.organization_id)
        if not activities:
            ActivityService.seed_all_departments(user.organization_id)
            activities = ActivityService.get_all(organization_id=user.organization_id)

    # Filter by user's tier
    accessible = [
        a for a in activities
        if _check_activity_tier(a, user)
    ]

    return jsonify({
        'success': True,
        'data': {
            'activities': [a.to_dict() for a in accessible],
            'total': len(accessible),
            'locked': len(activities) - len(accessible),
        },
        'message': 'Activities retrieved successfully'
    }), 200


@activities_bp.route('/<activity_id>', methods=['GET'])
@jwt_required_custom
def get_activity(activity_id: str):
    """Get a single activity with its execution logs"""
    user = g.current_user

    try:
        act_uuid = uuid.UUID(activity_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid activity ID'}
        }), 400

    activity = ActivityService.get_by_id(act_uuid)
    if not activity:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Activity not found'}
        }), 404

    # Verify department belongs to org
    dept = DepartmentService.get_by_id(activity.department_id, user.organization_id)
    if not dept:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}
        }), 403

    if not _check_activity_tier(activity, user):
        return jsonify({
            'success': False,
            'error': {
                'code': 'TIER_REQUIRED',
                'message': f'This activity requires {activity.tier_required} subscription',
                'required_tier': activity.tier_required,
            }
        }), 403

    logs = ActivityService.get_logs(act_uuid)

    return jsonify({
        'success': True,
        'data': {
            'activity': activity.to_dict(),
            'logs': [log.to_dict() for log in logs],
            'log_count': len(logs),
        },
        'message': 'Activity retrieved successfully'
    }), 200


@activities_bp.route('', methods=['POST'])
@jwt_required_custom
def create_activity():
    """Create a new activity in a department"""
    user = g.current_user

    try:
        data = create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input',
                'details': err.messages
            }
        }), 422

    department_id = request.get_json().get('department_id')
    if not department_id:
        return jsonify({
            'success': False,
            'error': {'code': 'MISSING_FIELD', 'message': 'department_id is required'}
        }), 400

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

    activity = ActivityService.create(
        department_id=dept_uuid,
        name=data['name'],
        activity_type=data['type'],
        description=data.get('description'),
        required_role=data.get('required_role'),
        tier_required=data.get('tier_required', 'free'),
        config=data.get('config', {})
    )

    return jsonify({
        'success': True,
        'data': {'activity': activity.to_dict()},
        'message': 'Activity created successfully'
    }), 201


@activities_bp.route('/<activity_id>', methods=['PUT'])
@jwt_required_custom
def update_activity(activity_id: str):
    """Update an activity"""
    user = g.current_user

    try:
        act_uuid = uuid.UUID(activity_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid activity ID'}
        }), 400

    activity = ActivityService.get_by_id(act_uuid)
    if not activity:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Activity not found'}
        }), 404

    dept = DepartmentService.get_by_id(activity.department_id, user.organization_id)
    if not dept:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}
        }), 403

    try:
        data = update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input',
                'details': err.messages
            }
        }), 422

    activity = ActivityService.update(activity, data)

    return jsonify({
        'success': True,
        'data': {'activity': activity.to_dict()},
        'message': 'Activity updated successfully'
    }), 200


@activities_bp.route('/<activity_id>', methods=['DELETE'])
@jwt_required_custom
def delete_activity(activity_id: str):
    """Soft delete an activity"""
    user = g.current_user

    try:
        act_uuid = uuid.UUID(activity_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid activity ID'}
        }), 400

    activity = ActivityService.get_by_id(act_uuid)
    if not activity:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Activity not found'}
        }), 404

    dept = DepartmentService.get_by_id(activity.department_id, user.organization_id)
    if not dept:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}
        }), 403

    ActivityService.delete(activity)

    return jsonify({
        'success': True,
        'data': {},
        'message': 'Activity deactivated successfully'
    }), 200


@activities_bp.route('/<activity_id>/execute', methods=['POST'])
@jwt_required_custom
def execute_activity(activity_id: str):
    """Execute an activity and log the result"""
    user = g.current_user

    try:
        act_uuid = uuid.UUID(activity_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid activity ID'}
        }), 400

    activity = ActivityService.get_by_id(act_uuid)
    if not activity:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Activity not found'}
        }), 404

    if not activity.is_active:
        return jsonify({
            'success': False,
            'error': {'code': 'INACTIVE', 'message': 'Activity is not active'}
        }), 400

    dept = DepartmentService.get_by_id(activity.department_id, user.organization_id)
    if not dept:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}
        }), 403

    if not _check_activity_tier(activity, user):
        return jsonify({
            'success': False,
            'error': {
                'code': 'TIER_REQUIRED',
                'message': f'This activity requires {activity.tier_required} subscription',
                'required_tier': activity.tier_required,
            }
        }), 403

    try:
        data = execute_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input',
                'details': err.messages
            }
        }), 422

    log = ActivityService.execute(
        activity=activity,
        user_id=user.id,
        notes=data.get('notes'),
        data=data.get('data', {})
    )

    return jsonify({
        'success': True,
        'data': {
            'log': log.to_dict(),
            'activity': activity.to_dict(),
        },
        'message': f'Activity "{activity.name}" executed successfully'
    }), 201


@activities_bp.route('/recent-logs', methods=['GET'])
@jwt_required_custom
def get_recent_logs():
    """Get recent activity logs across all departments"""
    user = g.current_user
    limit = min(int(request.args.get('limit', 10)), 50)

    logs = ActivityService.get_recent_logs(user.organization_id, limit=limit)

    return jsonify({
        'success': True,
        'data': {
            'logs': [log.to_dict() for log in logs],
            'total': len(logs),
        },
        'message': 'Recent logs retrieved'
    }), 200


from app.models.activity_log import ActivityLog
from app.models.department import Department
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request, jsonify
from app import db

@activities_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_activity_logs():
    current_user_id = get_jwt_identity()
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Filters
    department_id = request.args.get('department_id')
    status = request.args.get('status')
    date_from = request.args.get('date_from')   # ISO string: 2026-01-01
    date_to = request.args.get('date_to')       # ISO string: 2026-01-31

    query = ActivityLog.query

    if department_id:
        query = query.filter(ActivityLog.department_id == department_id)
    if status:
        query = query.filter(ActivityLog.status == status)
    if date_from:
        query = query.filter(ActivityLog.executed_at >= date_from)
    if date_to:
        query = query.filter(ActivityLog.executed_at <= date_to)

    paginated = query.order_by(ActivityLog.executed_at.desc())\
                     .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "data": {
            "logs": [log.to_dict() for log in paginated.items],
            "pagination": {
                "total": paginated.total,
                "pages": paginated.pages,
                "current_page": paginated.page,
                "per_page": per_page,
                "has_next": paginated.has_next,
                "has_prev": paginated.has_prev
            }
        }
    }), 200


@activities_bp.route('/logs', methods=['POST'])
@jwt_required()
def create_activity_log():
    """Called internally when an activity is executed"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    log = ActivityLog(
        activity_id=data['activity_id'],
        department_id=data['department_id'],
        executed_by=current_user_id,
        status=data.get('status', 'success'),
        notes=data.get('notes'),
        result_data=data.get('result_data', {})
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"success": True, "data": log.to_dict()}), 201