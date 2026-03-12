from app import db
from datetime import datetime

class Webhook(db.Model):
    __tablename__ = 'webhooks'

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(200), nullable=False)
    url        = db.Column(db.String(500), nullable=False)
    events     = db.Column(db.JSON, nullable=True)   # ['signal_critical', 'outcome_at_risk']
    secret     = db.Column(db.String(100), nullable=True)
    is_active  = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    deliveries = db.relationship('WebhookDelivery', backref='webhook', cascade='all, delete-orphan', lazy=True)


class WebhookDelivery(db.Model):
    __tablename__ = 'webhook_deliveries'

    id          = db.Column(db.Integer, primary_key=True)
    webhook_id  = db.Column(db.Integer, db.ForeignKey('webhooks.id'), nullable=False)
    event       = db.Column(db.String(100), nullable=False)
    payload     = db.Column(db.JSON, nullable=True)
    status_code = db.Column(db.Integer, nullable=True)
    success     = db.Column(db.Boolean, default=False)
    error       = db.Column(db.Text, nullable=True)
    delivered_at= db.Column(db.DateTime, default=datetime.utcnow)