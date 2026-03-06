from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, create_access_token
)
from marshmallow import ValidationError
from app.schemas.user_schema import RegisterSchema, LoginSchema
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

register_schema = RegisterSchema()
login_schema = LoginSchema()


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = register_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": err.messages
            }
        }), 422

    user, error = AuthService.register(
        email=data['email'],
        password=data['password'],
        full_name=data['full_name'],
        organization_name=data.get('organization_name')
    )

    if error:
        return jsonify({
            "success": False,
            "error": {"code": "REGISTRATION_FAILED", "message": error}
        }), 409

    return jsonify({
        "success": True,
        "data": {"user": user.to_dict()},
        "message": "Registration successful"
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return tokens"""
    try:
        data = login_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": err.messages
            }
        }), 422

    access_token, refresh_token, error = AuthService.login(
        email=data['email'],
        password=data['password']
    )

    if error:
        return jsonify({
            "success": False,
            "error": {"code": "LOGIN_FAILED", "message": error}
        }), 401

    return jsonify({
        "success": True,
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer"
        },
        "message": "Login successful"
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using refresh token"""
    current_user_id = get_jwt_identity()
    user = AuthService.get_user_by_id(current_user_id)

    if not user or not user.is_active:
        return jsonify({
            "success": False,
            "error": {"code": "INVALID_TOKEN", "message": "User not found or inactive"}
        }), 401

    new_access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "email": user.email,
            "organization_id": str(user.organization_id) if user.organization_id else None,
            "subscription_tier": user.subscription_tier,
        }
    )

    return jsonify({
        "success": True,
        "data": {"access_token": new_access_token},
        "message": "Token refreshed"
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client should delete tokens)"""
    # In a full implementation, you'd blacklist the token in Redis here
    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """Get current authenticated user info"""
    current_user_id = get_jwt_identity()
    user = AuthService.get_user_by_id(current_user_id)

    if not user:
        return jsonify({
            "success": False,
            "error": {"code": "USER_NOT_FOUND", "message": "User not found"}
        }), 404

    return jsonify({
        "success": True,
        "data": {"user": user.to_dict()},
        "message": "User retrieved successfully"
    }), 200