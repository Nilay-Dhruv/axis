from app import db
from datetime import datetime

class Automation(db.Model):
    __tablename__ = 'automations'

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(200), nullable=False)
    description= db.Column(db.Text, nullable=True)
    trigger    = db.Column(db.String(100), nullable=False)   # e.g. 'signal_critical', 'outcome_at_risk'
    condition  = db.Column(db.JSON, nullable=True)           # {"field": "value", "operator": "eq"}
    action     = db.Column(db.String(100), nullable=False)   # e.g. 'send_notification', 'update_status'
    action_config = db.Column(db.JSON, nullable=True)        # {"message": "...", "target": "..."}
    is_enabled = db.Column(db.Boolean, default=True)
    run_count  = db.Column(db.Integer, default=0)
    last_run_at= db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = db.relationship('User', backref='automations', lazy=True)


class AutomationRun(db.Model):
    __tablename__ = 'automation_runs'

    id            = db.Column(db.Integer, primary_key=True)
    automation_id = db.Column(db.Integer, db.ForeignKey('automations.id'), nullable=False)
    status        = db.Column(db.String(50), default='success')   # success | failed | skipped
    detail        = db.Column(db.Text, nullable=True)
    ran_at        = db.Column(db.DateTime, default=datetime.utcnow)

    automation = db.relationship('Automation', backref='runs', lazy=True)