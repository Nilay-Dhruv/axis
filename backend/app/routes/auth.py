from flask import Blueprint, g, request, jsonify
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, create_access_token
)
from app import limiter 
from app.middleware.auth_middleware import jwt_required_custom
from marshmallow import ValidationError
from app.schemas.user_schema import RegisterSchema, LoginSchema
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

register_schema = RegisterSchema()
login_schema = LoginSchema()


@auth_bp.route('/register', methods=['POST'])
@limiter.limit("10 per hour")
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
@limiter.limit("10 per hour")
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



@auth_bp.route('/profile', methods=['GET'])
@jwt_required_custom
def get_profile():
    """Get current user profile"""
    user = g.current_user
    return jsonify({
        'success': True,
        'data': {
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'subscription_tier': user.subscription_tier,
                'organization_id': str(user.organization_id) if user.organization_id else None,
                'is_active': user.is_active,
            }
        },
        'message': 'Profile retrieved'
    }), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required_custom
def update_profile():
    """Update name only — email is immutable"""
    user = g.current_user
    body = request.get_json() or {}
    full_name = body.get('full_name', '').strip()

    if not full_name or len(full_name) < 2:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': 'Name must be at least 2 characters'}
        }), 422

    user.full_name = full_name
    from app import db
    db.session.commit()

    return jsonify({
        'success': True,
        'data': {'full_name': user.full_name},
        'message': 'Profile updated successfully'
    }), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required_custom
def change_password():
    """Change password — requires current password"""
    user = g.current_user
    body = request.get_json() or {}

    current_password = body.get('current_password', '')
    new_password     = body.get('new_password', '')
    confirm_password = body.get('confirm_password', '')

    if not user.check_password(current_password):
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_PASSWORD', 'message': 'Current password is incorrect'}
        }), 400

    if len(new_password) < 8:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': 'New password must be at least 8 characters'}
        }), 422

    if new_password != confirm_password:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': 'Passwords do not match'}
        }), 422

    if new_password == current_password:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': 'New password must differ from current'}
        }), 422

    user.set_password(new_password)
    from app import db
    db.session.commit()

    return jsonify({
        'success': True,
        'data': {},
        'message': 'Password changed successfully'
    }), 200