from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app import db

admin_bp = Blueprint('admin', __name__, url_prefix='/api/v1/admin')

import uuid

def require_admin():
    uid = get_jwt_identity()

    try:
        uid = uuid.UUID(uid)
    except Exception:
        pass

    user = User.query.filter_by(id=uid).first()

    if not user or getattr(user, 'role', '') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    return None

@admin_bp.route('/users', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)          # ← optional=True lets OPTIONS pass through
def list_users():
    if request.method == 'OPTIONS':
        return jsonify({}), 200        # ← preflight always returns 200
    err = require_admin()
    if err: return err
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [
        {
            'id': u.id,
            'email': u.email,
            'name': getattr(u, 'username', None) or getattr(u, 'first_name', u.email),
            'role': getattr(u, 'role', 'viewer'),
            'is_active': getattr(u, 'is_active', True),
            'created_at': u.created_at.isoformat() if u.created_at else None,
        } for u in users
    ]}), 200

@admin_bp.route('/users/<user_id>/role', methods=['PUT', 'OPTIONS'])
@jwt_required(optional=True)
def update_user_role(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    err = require_admin()
    if err: return err
    data = request.get_json()
    user = User.query.get_or_404(user_id)
    user.role = data.get('role', user.role)
    db.session.commit()
    return jsonify({'message': 'Role updated', 'role': user.role}), 200

@admin_bp.route('/users/<user_id>/deactivate', methods=['PUT', 'OPTIONS'])
@jwt_required(optional=True)
def deactivate_user(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    err = require_admin()
    if err: return err
    user = User.query.get_or_404(user_id)
    user.is_active = not getattr(user, 'is_active', True)
    db.session.commit()
    status = 'activated' if user.is_active else 'deactivated'
    return jsonify({'message': f'User {status}', 'is_active': user.is_active}), 200

@admin_bp.route('/audit-log', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_audit_log():

    if request.method == 'OPTIONS':
        return jsonify({}), 200

    err = require_admin()
    if err:
        return err

    from app.models.activity_log import ActivityLog

    page = request.args.get('page', 1, type=int)
    per_page = 20

    status_filter = request.args.get('action', '')
    user_filter = request.args.get('user_id', '', type=str)

    query = ActivityLog.query.order_by(ActivityLog.executed_at.desc())

    if status_filter:
        query = query.filter(ActivityLog.status.ilike(f'%{status_filter}%'))

    if user_filter:
        try:
            query = query.filter(ActivityLog.executed_by == uuid.UUID(user_filter))
        except Exception:
            pass

    total = query.count()

    logs = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        "logs": [log.to_dict() for log in logs],
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page
    }), 200