from app import db, bcrypt
import uuid
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    organization_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('organizations.id'), nullable=True)
    subscription_tier = db.Column(db.String(50), default='free')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'full_name': self.full_name,
            'subscription_tier': self.subscription_tier,
            'organization_id': str(self.organization_id) if self.organization_id else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }