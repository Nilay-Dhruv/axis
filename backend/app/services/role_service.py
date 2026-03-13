from app import db
from app.models.role import Role
from app.models.user_role import UserRole
from app.models.user import User
import uuid
from datetime import datetime

# ─── Default role permission sets ──────────────────────────────────────────

DEFAULT_ROLES = [
    {
        'name':         'Viewer',
        'description':  'Read-only access to all departments and data',
        'tier_required': 'free',
        'is_default':   True,
        'is_system':    True,
        'permissions':  [
            'departments.view',
            'activities.view',
            'outcomes.view',
            'signals.view',
            'roles.view',
            'analytics.view',
            'settings.view',
            'users.view',
        ],
    },
    {
        'name':         'Editor',
        'description':  'Can create and update activities, outcomes, and signals',
        'tier_required': 'free',
        'is_default':   True,
        'is_system':    True,
        'permissions':  [
            'departments.view',
            'activities.view',
            'activities.create',
            'activities.update',
            'activities.execute',
            'outcomes.view',
            'outcomes.create',
            'outcomes.update',
            'signals.view',
            'signals.create',
            'signals.update',
            'roles.view',
            'analytics.view',
            'settings.view',
            'users.view',
        ],
    },
    {
        'name':         'Manager',
        'description':  'Full access to department operations and team management',
        'tier_required': 'basic_premium',
        'is_default':   True,
        'is_system':    True,
        'permissions':  [
            'departments.view',
            'departments.update',
            'activities.view',
            'activities.create',
            'activities.update',
            'activities.delete',
            'activities.execute',
            'outcomes.view',
            'outcomes.create',
            'outcomes.update',
            'outcomes.delete',
            'signals.view',
            'signals.create',
            'signals.update',
            'signals.delete',
            'roles.view',
            'roles.assign',
            'analytics.view',
            'settings.view',
            'users.view',
            'users.invite',
        ],
    },
    {
        'name':         'Admin',
        'description':  'Full administrative access including role and user management',
        'tier_required': 'premium',
        'is_default':   True,
        'is_system':    True,
        'permissions':  [
            'departments.view',
            'departments.create',
            'departments.update',
            'departments.delete',
            'activities.view',
            'activities.create',
            'activities.update',
            'activities.delete',
            'activities.execute',
            'outcomes.view',
            'outcomes.create',
            'outcomes.update',
            'outcomes.delete',
            'signals.view',
            'signals.create',
            'signals.update',
            'signals.delete',
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            'roles.assign',
            'analytics.view',
            'settings.view',
            'settings.update',
            'users.view',
            'users.invite',
            'users.remove',
        ],
    },
]

TIER_HIERARCHY = {'free': 0, 'basic_premium': 1, 'premium': 2}


class RoleService:

    @staticmethod
    def seed_default_roles(organization_id: uuid.UUID) -> list:
        """Seed the 4 default system roles for an org if not present"""
        existing = Role.query.filter_by(
            organization_id=organization_id,
            is_system=True
        ).count()
        if existing > 0:
            return []

        roles = []
        for tmpl in DEFAULT_ROLES:
            role = Role(
                organization_id=organization_id,
                name=tmpl['name'],
                description=tmpl['description'],
                permissions=tmpl['permissions'],
                tier_required=tmpl['tier_required'],
                is_default=tmpl['is_default'],
                is_system=tmpl['is_system'],
            )
            db.session.add(role)
            roles.append(role)

        db.session.commit()
        return roles
    
    @staticmethod
    def get_all(organization_id: uuid.UUID) -> list:
        return Role.query.filter_by(
            organization_id=organization_id
        ).order_by(Role.created_at.asc()).all()

    @staticmethod
    def get_by_id(role_id: uuid.UUID, organization_id: uuid.UUID):
        return Role.query.filter_by(
            id=role_id,
            organization_id=organization_id
        ).first()

    @staticmethod
    def create(
        organization_id: uuid.UUID,
        name: str,
        description: str = None,
        permissions: list = None,
        tier_required: str = 'free',
    ) -> Role:
        role = Role(
            organization_id=organization_id,
            name=name,
            description=description,
            permissions=permissions or [],
            tier_required=tier_required,
            is_default=False,
            is_system=False,
        )
        db.session.add(role)
        db.session.commit()
        return role

    @staticmethod
    def update(role: Role, data: dict) -> Role:
        allowed = ['name', 'description', 'permissions', 'tier_required']
        for key in allowed:
            if key in data:
                setattr(role, key, data[key])
        role.updated_at = datetime.utcnow()
        db.session.commit()
        return role

    @staticmethod
    def delete(role: Role):
        # Also remove all user assignments for this role
        UserRole.query.filter_by(role_id=role.id).delete()
        db.session.delete(role)
        db.session.commit()

    @staticmethod
    def assign_to_user(
        role_id: uuid.UUID,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        assigned_by: uuid.UUID,
        department_id: uuid.UUID = None,
    ) -> UserRole:
        # Check for existing assignment
        existing = UserRole.query.filter_by(
            user_id=user_id,
            role_id=role_id,
            organization_id=organization_id,
        ).first()
        if existing:
            return existing

        assignment = UserRole(
            user_id=user_id,
            role_id=role_id,
            organization_id=organization_id,
            department_id=department_id,
            assigned_by=assigned_by,
        )
        db.session.add(assignment)
        db.session.commit()
        return assignment

    @staticmethod
    def revoke_from_user(
        role_id: uuid.UUID,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
    ) -> bool:
        assignment = UserRole.query.filter_by(
            role_id=role_id,
            user_id=user_id,
            organization_id=organization_id,
        ).first()
        if not assignment:
            return False
        db.session.delete(assignment)
        db.session.commit()
        return True

    @staticmethod
    def get_user_assignments(organization_id: uuid.UUID) -> list:
        """Get all user-role assignments in an org"""
        return (
            UserRole.query
            .filter_by(organization_id=organization_id)
            .order_by(UserRole.assigned_at.desc())
            .all()
        )

    @staticmethod
    def get_roles_for_user(
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
    ) -> list:
        assignments = UserRole.query.filter_by(
            user_id=user_id,
            organization_id=organization_id,
        ).all()
        return [a.role for a in assignments if a.role]

    @staticmethod
    def user_has_permission(
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        permission: str,
    ) -> bool:
        """Check if a user has a specific permission via any of their roles"""
        roles = RoleService.get_roles_for_user(user_id, organization_id)
        for role in roles:
            if permission in (role.permissions or []):
                return True
        return False

    @staticmethod
    def get_permission_matrix() -> dict:
        """Return grouped permission matrix for the frontend"""
        groups = {
            'Departments': [p for p in _all_perms() if p.startswith('departments.')],
            'Activities':  [p for p in _all_perms() if p.startswith('activities.')],
            'Outcomes':    [p for p in _all_perms() if p.startswith('outcomes.')],
            'Signals':     [p for p in _all_perms() if p.startswith('signals.')],
            'Roles':       [p for p in _all_perms() if p.startswith('roles.')],
            'Analytics':   [p for p in _all_perms() if p.startswith('analytics.')],
            'Settings':    [p for p in _all_perms() if p.startswith('settings.')],
            'Users':       [p for p in _all_perms() if p.startswith('users.')],
        }
        return groups


def _all_perms() -> list:
    from app.schemas.role_schema import ALL_PERMISSIONS
    return ALL_PERMISSIONS