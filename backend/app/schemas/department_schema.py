from marshmallow import Schema, fields, validate, validates, ValidationError

VALID_DEPARTMENT_TYPES = [
    'leadership', 'finance', 'sales', 'marketing',
    'operations', 'hr', 'product', 'engineering',
    'legal', 'custom'
]

class DepartmentCreateSchema(Schema):
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=255),
        error_messages={'required': 'Department name is required'}
    )
    type = fields.Str(
        required=True,
        validate=validate.OneOf(VALID_DEPARTMENT_TYPES),
        error_messages={'required': 'Department type is required'}
    )
    config = fields.Dict(load_default={})

    @validates('name')
    def validate_name(self, value):
        if value.strip() == '':
            raise ValidationError('Department name cannot be empty')


class DepartmentUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, max=255))
    config = fields.Dict()