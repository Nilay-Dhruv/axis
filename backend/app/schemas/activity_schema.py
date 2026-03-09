from marshmallow import Schema, fields, validate, validates, ValidationError

VALID_ACTIVITY_TYPES = [
    'track', 'approve', 'review', 'execute',
    'report', 'monitor', 'alert', 'schedule'
]

VALID_TIERS = ['free', 'basic_premium', 'premium']


class ActivityCreateSchema(Schema):
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=255),
        error_messages={'required': 'Activity name is required'}
    )

    type = fields.Str(
        required=True,
        validate=validate.OneOf(VALID_ACTIVITY_TYPES),
        error_messages={'required': 'Activity type is required'}
    )

    description = fields.Str(load_default=None)

    required_role = fields.Str(
        load_default=None,
        validate=validate.Length(max=100)
    )

    tier_required = fields.Str(
        load_default='free',
        validate=validate.OneOf(VALID_TIERS)
    )

    config = fields.Dict(load_default={})

    @validates('name')
    def validate_name(self, value):
        if value.strip() == '':
            raise ValidationError('Activity name cannot be empty')


class ActivityUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, max=255))
    type = fields.Str(validate=validate.OneOf(VALID_ACTIVITY_TYPES))
    description = fields.Str(allow_none=True)
    required_role = fields.Str(allow_none=True)
    tier_required = fields.Str(validate=validate.OneOf(VALID_TIERS))
    config = fields.Dict()
    is_active = fields.Bool()


class ActivityExecuteSchema(Schema):
    notes = fields.Str(load_default=None)
    data = fields.Dict(load_default={})