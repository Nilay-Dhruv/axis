from marshmallow import Schema, fields, validate, validates, ValidationError

class RegisterSchema(Schema):
    email = fields.Email(required=True, error_messages={"required": "Email is required"})
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, error="Password must be at least 8 characters"),
        error_messages={"required": "Password is required"}
    )
    full_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=255),
        error_messages={"required": "Full name is required"}
    )
    organization_name = fields.Str(
        required=False,
        validate=validate.Length(min=2, max=255)
    )

    @validates('password')
    def validate_password_strength(self, value, **kwargs):
        if not any(c.isupper() for c in value):
            raise ValidationError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in value):
            raise ValidationError("Password must contain at least one number")


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)