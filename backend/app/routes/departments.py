from flask import Blueprint, request, jsonify, g
from marshmallow import ValidationError
from app.schemas.department_schema import DepartmentCreateSchema, DepartmentUpdateSchema
from app.services.department_service import DepartmentService
from app.middleware.auth_middleware import jwt_required_custom, tier_required
import uuid

departments_bp = Blueprint('departments', __name__)

create_schema = DepartmentCreateSchema()
update_schema = DepartmentUpdateSchema()


@departments_bp.route('', methods=['GET'])
@jwt_required_custom
def get_departments():
    """Get all departments for the organization"""
    user = g.current_user

    if not user.organization_id:
        return jsonify({
            'success': True,
            'data': {'departments': [], 'total': 0},
            'message': 'No organization found'
        }), 200

    # Auto-seed default departments if none exist
    existing = DepartmentService.get_all(user.organization_id)
    if not existing:
        DepartmentService.seed_default_departments(
            organization_id=user.organization_id,
            owner_id=user.id
        )
        existing = DepartmentService.get_all(user.organization_id)

    return jsonify({
        'success': True,
        'data': {
            'departments': [d.to_dict() for d in existing],
            'total': len(existing)
        },
        'message': 'Departments retrieved successfully'
    }), 200


@departments_bp.route('/<department_id>', methods=['GET'])
@jwt_required_custom
def get_department(department_id: str):
    """Get a single department with activities and outcomes"""
    user = g.current_user

    try:
        dept_uuid = uuid.UUID(department_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid department ID'}
        }), 400

    dept, activities, outcomes = DepartmentService.get_with_activities_and_outcomes(
        dept_uuid, user.organization_id
    )

    if not dept:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Department not found'}
        }), 404

    return jsonify({
        'success': True,
        'data': {
            'department': dept.to_dict(),
            'activities': [a.to_dict() for a in activities],
            'outcomes': [o.to_dict() for o in outcomes],
        },
        'message': 'Department retrieved successfully'
    }), 200


@departments_bp.route('', methods=['POST'])
@jwt_required_custom
@tier_required('premium')
def create_department():
    """Create a custom department (Premium only)"""
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

    dept = DepartmentService.create(
        organization_id=user.organization_id,
        owner_id=user.id,
        name=data['name'],
        dept_type=data['type'],
        config=data.get('config', {})
    )

    return jsonify({
        'success': True,
        'data': {'department': dept.to_dict()},
        'message': 'Department created successfully'
    }), 201


@departments_bp.route('/<department_id>', methods=['PUT'])
@jwt_required_custom
def update_department(department_id: str):
    """Update a department"""
    user = g.current_user

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

    try:
        data = update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': 'Invalid input', 'details': err.messages}
        }), 422

    dept = DepartmentService.update(
        dept,
        name=data.get('name'),
        config=data.get('config')
    )

    return jsonify({
        'success': True,
        'data': {'department': dept.to_dict()},
        'message': 'Department updated successfully'
    }), 200


@departments_bp.route('/<department_id>', methods=['DELETE'])
@jwt_required_custom
@tier_required('premium')
def delete_department(department_id: str):
    """Delete a custom department (Premium only)"""
    user = g.current_user

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

    success, error = DepartmentService.delete(dept)
    if not success:
        return jsonify({
            'success': False,
            'error': {'code': 'DELETE_FAILED', 'message': error}
        }), 400

    return jsonify({
        'success': True,
        'data': {},
        'message': 'Department deleted successfully'
    }), 200


@departments_bp.route('/<department_id>/seed', methods=['POST'])
@jwt_required_custom
def seed_departments(department_id: str):
    """Manually trigger department seeding"""
    user = g.current_user

    if not user.organization_id:
        return jsonify({
            'success': False,
            'error': {'code': 'NO_ORG', 'message': 'No organization found'}
        }), 400

    depts = DepartmentService.seed_default_departments(
        organization_id=user.organization_id,
        owner_id=user.id
    )

    return jsonify({
        'success': True,
        'data': {'departments': [d.to_dict() for d in depts]},
        'message': f'Seeded {len(depts)} departments'
    }), 201