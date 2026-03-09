from marshmallow import Schema, fields, validate, validates, ValidationError

VALID_STATUSES = ['active', 'achieved', 'at_risk', 'inactive']


class OutcomeCreateSchema(Schema):
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=255),
        error_messages={'required': 'Outcome name is required'}
    )

    description = fields.Str(load_default=None)
    target_value = fields.Float(load_default=None)
    current_value = fields.Float(load_default=None)
    unit = fields.Str(load_default=None, validate=validate.Length(max=50))

    status = fields.Str(
        load_default='active',
        validate=validate.OneOf(VALID_STATUSES)
    )

    @validates('name')
    def validate_name(self, value):
        if value.strip() == '':
            raise ValidationError('Outcome name cannot be empty')


class OutcomeUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, max=255))
    description = fields.Str(allow_none=True)
    target_value = fields.Float(allow_none=True)
    current_value = fields.Float(allow_none=True)
    unit = fields.Str(allow_none=True)
    status = fields.Str(validate=validate.OneOf(VALID_STATUSES))


class SignalCreateSchema(Schema):
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=255),
        error_messages={'required': 'Signal name is required'}
    )

    value = fields.Float(load_default=None)
    threshold_min = fields.Float(load_default=None)
    threshold_max = fields.Float(load_default=None)


class SignalUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, max=255))
    value = fields.Float(allow_none=True)
    threshold_min = fields.Float(allow_none=True)
    threshold_max = fields.Float(allow_none=True)