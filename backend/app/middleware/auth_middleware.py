from functools import wraps
from flask import jsonify, g
from flask_jwt_extended import get_jwt_identity, get_jwt, verify_jwt_in_request
from app.models.user import User
import uuid


def jwt_required_custom(f):
    """Custom JWT middleware that loads user into g"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(uuid.UUID(user_id))
            if not user or not user.is_active:
                return jsonify({
                    'success': False,
                    'error': {'code': 'UNAUTHORIZED', 'message': 'User not found or inactive'}
                }), 401
            g.current_user = user
            g.jwt_claims = get_jwt()
        except Exception as e:
            return jsonify({
                'success': False,
                'error': {'code': 'UNAUTHORIZED', 'message': 'Invalid or expired token'}
            }), 401
        return f(*args, **kwargs)
    return decorated


def tier_required(required_tier: str):
    """Decorator to enforce subscription tier"""
    TIER_HIERARCHY = {'free': 0, 'basic_premium': 1, 'premium': 2}

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = getattr(g, 'current_user', None)
            if not user:
                return jsonify({
                    'success': False,
                    'error': {'code': 'UNAUTHORIZED', 'message': 'Authentication required'}
                }), 401

            user_level = TIER_HIERARCHY.get(user.subscription_tier, 0)
            required_level = TIER_HIERARCHY.get(required_tier, 0)

            if user_level < required_level:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'TIER_REQUIRED',
                        'message': f'This feature requires {required_tier} subscription',
                        'required_tier': required_tier,
                        'current_tier': user.subscription_tier
                    }
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator