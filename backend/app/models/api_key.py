from app import db
from datetime import datetime
import secrets

class ApiKey(db.Model):
    __tablename__ = 'api_keys'

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(200), nullable=False)
    key_hash   = db.Column(db.String(200), nullable=False, unique=True)
    key_prefix = db.Column(db.String(10), nullable=False)   # first 8 chars shown to user
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_active  = db.Column(db.Boolean, default=True)
    last_used_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='api_keys', lazy=True)

    @staticmethod
    def generate():
        raw = 'axis_' + secrets.token_urlsafe(32)
        return raw