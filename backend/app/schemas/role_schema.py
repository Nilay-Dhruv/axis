from marshmallow import Schema, fields, validate, validates, ValidationError

VALID_TIERS = ['free', 'basic_premium', 'premium']

# Full permission matrix — all possible permissions in the system
ALL_PERMISSIONS = [
    # Departments
    'departments.view',
    'departments.create',
    'departments.update',
    'departments.delete',
    # Activities
    'activities.view',
    'activities.create',
    'activities.update',
    'activities.delete',
    'activities.execute',
    # Outcomes
    'outcomes.view',
    'outcomes.create',
    'outcomes.update',
    'outcomes.delete',
    # Signals
    'signals.view',
    'signals.create',
    'signals.update',
    'signals.delete',
    # Roles
    'roles.view',
    'roles.create',
    'roles.update',
    'roles.delete',
    'roles.assign',
    # Analytics
    'analytics.view',
    # Settings
    'settings.view',
    'settings.update',
    # Users
    'users.view',
    'users.invite',
    'users.remove',
]


class RoleCreateSchema(Schema):
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={'required': 'Role name is required'}
    )
    description  = fields.Str(load_default=None)
    permissions  = fields.List(fields.Str(), load_default=[])
    tier_required = fields.Str(
        load_default='free',
        validate=validate.OneOf(VALID_TIERS)
    )

    @validates('name')
    def validate_name(self, value):
        if value.strip() == '':
            raise ValidationError('Role name cannot be empty')

    @validates('permissions')
    def validate_permissions(self, value):
        invalid = [p for p in value if p not in ALL_PERMISSIONS]
        if invalid:
            raise ValidationError(f'Invalid permissions: {invalid}')


class RoleUpdateSchema(Schema):
    name          = fields.Str(validate=validate.Length(min=2, max=100))
    description   = fields.Str(allow_none=True)
    permissions   = fields.List(fields.Str())
    tier_required = fields.Str(validate=validate.OneOf(VALID_TIERS))

    @validates('permissions')
    def validate_permissions(self, value):
        invalid = [p for p in value if p not in ALL_PERMISSIONS]
        if invalid:
            raise ValidationError(f'Invalid permissions: {invalid}')


class RoleAssignSchema(Schema):
    user_id       = fields.Str(required=True, error_messages={'required': 'user_id is required'})
    department_id = fields.Str(load_default=None)