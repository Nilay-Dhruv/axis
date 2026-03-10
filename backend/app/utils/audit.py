from app import db
from app.models.audit_log import AuditLog
from flask import request
from flask_jwt_extended import get_jwt_identity

def log_action(action: str, resource_type: str = None, resource_id: int = None, detail: str = None):
    try:
        uid = get_jwt_identity()
        entry = AuditLog(
            user_id=uid,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            detail=detail,
            ip_address=request.remote_addr
        )
        db.session.add(entry)
        db.session.commit()
    except Exception:
        pass  # Audit logging must never crash the main request