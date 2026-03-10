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


@auth_bp.route('/dashboard/summary', methods=['GET'])
@jwt_required_custom
def dashboard_summary():
    """Aggregate stats for the dashboard"""
    from app import db
    from app.models.department import Department
    from app.models import ActivityLog
    from app.models.outcome import Outcome
    from app.models.signal import Signal
    from sqlalchemy import func
    from datetime import datetime, timedelta

    org_id = g.current_user.organization_id

    # Department count
    dept_count = db.session.query(func.count(Department.id))\
        .filter(Department.organization_id == org_id).scalar() or 0

    # Outcome stats
    outcomes = db.session.query(Outcome).join(Department)\
        .filter(Department.organization_id == org_id).all()
    outcome_count    = len(outcomes)
    achieved_count   = sum(1 for o in outcomes if o.status == 'achieved')
    at_risk_count    = sum(1 for o in outcomes if o.status == 'at_risk')
    avg_progress     = (
        sum(min((o.current_value / o.target_value) * 100, 100)
            for o in outcomes if o.target_value and o.target_value > 0)
        / outcome_count
    ) if outcome_count else 0

    # Signal health
    signals = db.session.query(Signal).join(Outcome).join(Department)\
        .filter(Department.organization_id == org_id).all()
    signal_count    = len(signals)
    critical_count  = sum(1 for s in signals if s.status == 'critical')
    warning_count   = sum(1 for s in signals if s.status == 'warning')
    normal_count    = sum(1 for s in signals if s.status == 'normal')

    # Recent activity logs (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_logs = db.session.query(ActivityLog)\
        .join(ActivityLog.activity)\
        .filter(ActivityLog.executed_at >= week_ago)\
        .order_by(ActivityLog.executed_at.desc())\
        .limit(5).all()

    logs_data = []
    for log in recent_logs:
        logs_data.append({
            'id':           str(log.id),
            'activity_name': log.activity.name if log.activity else 'Unknown',
            'status':       log.status,
            'executed_at':  log.executed_at.isoformat() if log.executed_at else None,
        })

    return jsonify({
        'success': True,
        'data': {
            'departments': {
                'total': dept_count,
            },
            'outcomes': {
                'total':       outcome_count,
                'achieved':    achieved_count,
                'at_risk':     at_risk_count,
                'avg_progress': round(avg_progress, 1),
            },
            'signals': {
                'total':    signal_count,
                'critical': critical_count,
                'warning':  warning_count,
                'normal':   normal_count,
            },
            'recent_activity': logs_data,
        },
        'message': 'Dashboard summary retrieved'
    }), 200


@auth_bp.route('/analytics/overview', methods=['GET'])
@jwt_required_custom
def analytics_overview():
    """Comprehensive analytics data for the analytics page"""
    from app import db
    from app.models.department import Department
    from app.models.activity import Activity
    from app.models import ActivityLog
    from app.models.outcome import Outcome
    from app.models.signal import Signal
    from sqlalchemy import func
    from datetime import datetime, timedelta

    org_id = g.current_user.organization_id

    # ── Activity trend: last 30 days grouped by day ──────────────────
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    daily_logs = db.session.query(
        func.date(ActivityLog.executed_at).label('day'),
        func.count(ActivityLog.id).label('count'),
        func.sum(
            db.case((ActivityLog.status == 'completed', 1), else_=0)
        ).label('completed'),
        func.sum(
            db.case((ActivityLog.status == 'failed', 1), else_=0)
        ).label('failed'),
    ).join(ActivityLog.activity).join(Activity.department)\
     .filter(
         Department.organization_id == org_id,
         ActivityLog.executed_at >= thirty_days_ago,
     ).group_by(func.date(ActivityLog.executed_at))\
      .order_by(func.date(ActivityLog.executed_at)).all()

    trend_data = [
        {
            'day':       str(row.day),
            'total':     row.count,
            'completed': int(row.completed or 0),
            'failed':    int(row.failed    or 0),
        }
        for row in daily_logs
    ]

    # ── Department performance ────────────────────────────────────────
    departments = db.session.query(Department)\
        .filter(Department.organization_id == org_id).all()

    dept_perf = []
    for dept in departments:
        outcomes = db.session.query(Outcome)\
            .filter(Outcome.department_id == dept.id).all()
        if not outcomes:
            avg_prog = 0.0
        else:
            avg_prog = sum(
                min((o.current_value / o.target_value) * 100, 100)
                for o in outcomes
                if o.target_value and o.target_value > 0
            ) / len(outcomes)

        activity_count = db.session.query(func.count(ActivityLog.id))\
            .join(ActivityLog.activity).join(Activity.department)\
            .filter(
                Department.id == dept.id,
                ActivityLog.executed_at >= thirty_days_ago,
            ).scalar() or 0

        dept_perf.append({
            'name':           dept.name,
            'avg_progress':   round(avg_prog, 1),
            'activity_count': activity_count,
            'outcome_count':  len(outcomes),
        })

    # Sort by avg_progress desc
    dept_perf.sort(key=lambda d: d['avg_progress'], reverse=True)

    # ── Outcome status breakdown ──────────────────────────────────────
    all_outcomes = db.session.query(Outcome).join(Department)\
        .filter(Department.organization_id == org_id).all()

    outcome_status = {
        'achieved':    sum(1 for o in all_outcomes if o.status == 'achieved'),
        'on_track':    sum(1 for o in all_outcomes if o.status == 'on_track'),
        'at_risk':     sum(1 for o in all_outcomes if o.status == 'at_risk'),
        'not_started': sum(1 for o in all_outcomes if o.status == 'not_started'),
    }

    # ── Signal distribution ───────────────────────────────────────────
    all_signals = db.session.query(Signal).join(Outcome).join(Department)\
        .filter(Department.organization_id == org_id).all()

    signal_dist = {
        'normal':   sum(1 for s in all_signals if s.status == 'normal'),
        'warning':  sum(1 for s in all_signals if s.status == 'warning'),
        'critical': sum(1 for s in all_signals if s.status == 'critical'),
    }

    # ── Top outcomes by progress ──────────────────────────────────────
    top_outcomes = sorted(
        [
            {
                'name':     o.name,
                'progress': round(
                    min((o.current_value / o.target_value) * 100, 100), 1
                ) if o.target_value and o.target_value > 0 else 0,
                'status': o.status,
                'unit':   o.unit or '',
            }
            for o in all_outcomes
        ],
        key=lambda x: x['progress'],
        reverse=True,
    )[:6]

    return jsonify({
        'success': True,
        'data': {
            'activity_trend':   trend_data,
            'dept_performance': dept_perf,
            'outcome_status':   outcome_status,
            'signal_dist':      signal_dist,
            'top_outcomes':     top_outcomes,
        },
        'message': 'Analytics overview retrieved',
    }), 200



@auth_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    from app.models.signal import Signal
    from app.models.outcome import Outcome
    from datetime import datetime

    notifications = []

    critical_signals = Signal.query.filter_by(status='critical').limit(10).all()
    for s in critical_signals:
        notifications.append({
            'id': f'sig-{s.id}',
            'type': 'critical',
            'title': f'Critical Signal: {s.name}',
            'message': f'Signal "{s.name}" has reached critical status.',
            'timestamp': (getattr(s, 'updated_at', None) or getattr(s, 'created_at', None) or datetime.utcnow()).isoformat(),
            'read': False,
            'url': f'/signals/{s.id}'
        })

    at_risk = Outcome.query.filter_by(status='at_risk').limit(10).all()
    for o in at_risk:
        notifications.append({
            'id': f'out-{o.id}',
            'type': 'warning',
            'title': f'Outcome At Risk: {o.title}',
            'message': f'"{o.title}" is marked as at-risk.',
            'timestamp': (getattr(o, 'updated_at', None) or getattr(o, 'created_at', None) or datetime.utcnow()).isoformat(),
            'read': False,
            'url': f'/outcomes/{o.id}'
        })

    notifications.sort(key=lambda x: x['timestamp'], reverse=True)
    return jsonify({'notifications': notifications[:20], 'unread_count': len(notifications)}), 200