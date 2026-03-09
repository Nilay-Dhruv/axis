from flask import Blueprint, request, jsonify, g
from marshmallow import ValidationError
from app.schemas.role_schema import (
    RoleCreateSchema, RoleUpdateSchema, RoleAssignSchema, ALL_PERMISSIONS
)
from app.services.role_service import RoleService, TIER_HIERARCHY
from app.middleware.auth_middleware import jwt_required_custom, tier_required
from app.models.user import User
import uuid

roles_bp = Blueprint('roles', __name__)

create_schema = RoleCreateSchema()
update_schema = RoleUpdateSchema()
assign_schema = RoleAssignSchema()


# ── Helpers ────────────────────────────────────────────────────────────────

def _can_manage_roles(user) -> bool:
    """Check user has roles.create/update/delete permission OR is premium"""
    tier_level = TIER_HIERARCHY.get(user.subscription_tier, 0)
    return tier_level >= TIER_HIERARCHY['basic_premium']


# ── Role CRUD ──────────────────────────────────────────────────────────────

@roles_bp.route('', methods=['GET'])
@jwt_required_custom
def get_roles():
    user = g.current_user

    roles = RoleService.get_all(user.organization_id)
    if not roles:
        RoleService.seed_default_roles(user.organization_id)
        roles = RoleService.get_all(user.organization_id)

    return jsonify({
        'success': True,
        'data': {
            'roles': [r.to_dict() for r in roles],
            'total': len(roles),
        },
        'message': 'Roles retrieved successfully'
    }), 200


@roles_bp.route('/permissions', methods=['GET'])
@jwt_required_custom
def get_permissions():
    """Return the full permission matrix grouped by resource"""
    matrix = RoleService.get_permission_matrix()
    return jsonify({
        'success': True,
        'data': {
            'matrix': matrix,
            'all':    ALL_PERMISSIONS,
            'total':  len(ALL_PERMISSIONS),
        },
        'message': 'Permission matrix retrieved'
    }), 200


@roles_bp.route('/my-permissions', methods=['GET'])
@jwt_required_custom
def get_my_permissions():
    """Return current user's effective permissions across all assigned roles"""
    user  = g.current_user
    roles = RoleService.get_roles_for_user(user.id, user.organization_id)

    effective: set = set()
    for role in roles:
        effective.update(role.permissions or [])

    return jsonify({
        'success': True,
        'data': {
            'permissions': sorted(effective),
            'roles':       [r.to_dict() for r in roles],
            'role_count':  len(roles),
        },
        'message': 'Permissions retrieved'
    }), 200


@roles_bp.route('/<role_id>', methods=['GET'])
@jwt_required_custom
def get_role(role_id: str):
    user = g.current_user

    try:
        role_uuid = uuid.UUID(role_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid role ID'}
        }), 400

    role = RoleService.get_by_id(role_uuid, user.organization_id)
    if not role:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Role not found'}
        }), 404

    # Get assignments for this role
    assignments = [
        a for a in RoleService.get_user_assignments(user.organization_id)
        if a.role_id == role_uuid
    ]

    return jsonify({
        'success': True,
        'data': {
            'role':        role.to_dict(),
            'assignments': [a.to_dict() for a in assignments],
            'member_count': len(assignments),
        },
        'message': 'Role retrieved successfully'
    }), 200


@roles_bp.route('', methods=['POST'])
@jwt_required_custom
def create_role():
    user = g.current_user

    if not _can_manage_roles(user):
        return jsonify({
            'success': False,
            'error': {
                'code':          'TIER_REQUIRED',
                'message':       'Creating custom roles requires basic_premium or higher',
                'required_tier': 'basic_premium',
            }
        }), 403

    try:
        data = create_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code':    'VALIDATION_ERROR',
                'message': 'Invalid input',
                'details': err.messages,
            }
        }), 422

    # Ensure name is unique in org
    existing = [
        r for r in RoleService.get_all(user.organization_id)
        if r.name.lower() == data['name'].lower()
    ]
    if existing:
        return jsonify({
            'success': False,
            'error': {'code': 'DUPLICATE', 'message': 'A role with this name already exists'}
        }), 409

    role = RoleService.create(
        organization_id=user.organization_id,
        name=data['name'],
        description=data.get('description'),
        permissions=data.get('permissions', []),
        tier_required=data.get('tier_required', 'free'),
    )

    return jsonify({
        'success': True,
        'data':    {'role': role.to_dict()},
        'message': 'Role created successfully'
    }), 201


@roles_bp.route('/<role_id>', methods=['PUT'])
@jwt_required_custom
def update_role(role_id: str):
    user = g.current_user

    if not _can_manage_roles(user):
        return jsonify({
            'success': False,
            'error': {
                'code':          'TIER_REQUIRED',
                'message':       'Updating roles requires basic_premium or higher',
                'required_tier': 'basic_premium',
            }
        }), 403

    try:
        role_uuid = uuid.UUID(role_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid role ID'}
        }), 400

    role = RoleService.get_by_id(role_uuid, user.organization_id)
    if not role:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Role not found'}
        }), 404

    if role.is_system:
        return jsonify({
            'success': False,
            'error': {'code': 'SYSTEM_ROLE', 'message': 'System roles cannot be modified'}
        }), 403

    try:
        data = update_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': {
                'code':    'VALIDATION_ERROR',
                'message': 'Invalid input',
                'details': err.messages,
            }
        }), 422

    role = RoleService.update(role, data)

    return jsonify({
        'success': True,
        'data':    {'role': role.to_dict()},
        'message': 'Role updated successfully'
    }), 200


@roles_bp.route('/<role_id>', methods=['DELETE'])
@jwt_required_custom
def delete_role(role_id: str):
    user = g.current_user

    if not _can_manage_roles(user):
        return jsonify({
            'success': False,
            'error': {
                'code':          'TIER_REQUIRED',
                'message':       'Deleting roles requires basic_premium or higher',
                'required_tier': 'basic_premium',
            }
        }), 403

    try:
        role_uuid = uuid.UUID(role_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid role ID'}
        }), 400

    role = RoleService.get_by_id(role_uuid, user.organization_id)
    if not role:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Role not found'}
        }), 404

    if role.is_system:
        return jsonify({
            'success': False,
            'error': {'code': 'SYSTEM_ROLE', 'message': 'System roles cannot be deleted'}
        }), 403

    RoleService.delete(role)

    return jsonify({
        'success': True,
        'data':    {},
        'message': 'Role deleted successfully'
    }), 200


# ── Assignments ────────────────────────────────────────────────────────────

@roles_bp.route('/assignments', methods=['GET'])
@jwt_required_custom
def get_assignments():
    """Get all user-role assignments in the org"""
    user        = g.current_user
    assignments = RoleService.get_user_assignments(user.organization_id)
    return jsonify({
        'success': True,
        'data': {
            'assignments': [a.to_dict() for a in assignments],
            'total':       len(assignments),
        },
        'message': 'Assignments retrieved'
    }), 200


@roles_bp.route('/<role_id>/assign', methods=['POST'])
@jwt_required_custom
def assign_role(role_id: str):
    user = g.current_user

    if not _can_manage_roles(user):
        return jsonify({
            'success': False,
            'error': {
                'code':          'TIER_REQUIRED',
                'message':       'Assigning roles requires basic_premium or higher',
                'required_tier': 'basic_premium',
            }
        }), 403

    try:
        role_uuid = uuid.UUID(role_id)
        data      = assign_schema.load(request.get_json() or {})
    except (ValueError, ValidationError) as err:
        msg = err.messages if hasattr(err, 'messages') else 'Invalid role ID'
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': 'Invalid input', 'details': msg}
        }), 422

    role = RoleService.get_by_id(role_uuid, user.organization_id)
    if not role:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Role not found'}
        }), 404

    # Validate target user exists in same org
    try:
        target_user_id = uuid.UUID(data['user_id'])
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid user_id'}
        }), 400

    target_user = User.query.filter_by(
        id=target_user_id,
        organization_id=user.organization_id,
    ).first()
    if not target_user:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'User not found in this organization'}
        }), 404

    dept_id = None
    if data.get('department_id'):
        try:
            dept_id = uuid.UUID(data['department_id'])
        except ValueError:
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_ID', 'message': 'Invalid department_id'}
            }), 400

    assignment = RoleService.assign_to_user(
        role_id=role_uuid,
        user_id=target_user_id,
        organization_id=user.organization_id,
        assigned_by=user.id,
        department_id=dept_id,
    )

    return jsonify({
        'success': True,
        'data':    {'assignment': assignment.to_dict()},
        'message': f'Role "{role.name}" assigned to {target_user.full_name}'
    }), 201


@roles_bp.route('/<role_id>/revoke', methods=['POST'])
@jwt_required_custom
def revoke_role(role_id: str):
    user = g.current_user

    if not _can_manage_roles(user):
        return jsonify({
            'success': False,
            'error': {
                'code':          'TIER_REQUIRED',
                'message':       'Revoking roles requires basic_premium or higher',
                'required_tier': 'basic_premium',
            }
        }), 403

    try:
        role_uuid = uuid.UUID(role_id)
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid role ID'}
        }), 400

    body = request.get_json() or {}
    try:
        target_user_id = uuid.UUID(body.get('user_id', ''))
    except ValueError:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_ID', 'message': 'Invalid user_id'}
        }), 400

    role = RoleService.get_by_id(role_uuid, user.organization_id)
    if not role:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Role not found'}
        }), 404

    revoked = RoleService.revoke_from_user(
        role_id=role_uuid,
        user_id=target_user_id,
        organization_id=user.organization_id,
    )

    if not revoked:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Assignment not found'}
        }), 404

    return jsonify({
        'success': True,
        'data':    {},
        'message': 'Role revoked successfully'
    }), 200


@roles_bp.route('/check', methods=['POST'])
@jwt_required_custom
def check_permission():
    """Check if the current user has a specific permission"""
    user = g.current_user
    body = request.get_json() or {}
    permission = body.get('permission', '')

    if permission not in ALL_PERMISSIONS:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_PERMISSION', 'message': 'Unknown permission'}
        }), 400

    has_perm = RoleService.user_has_permission(
        user.id, user.organization_id, permission
    )

    return jsonify({
        'success': True,
        'data': {
            'permission': permission,
            'granted':    has_perm,
        },
        'message': 'Permission check complete'
    }), 200