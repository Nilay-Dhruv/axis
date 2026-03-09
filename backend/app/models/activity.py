from app import db
import uuid
from datetime import datetime

class Activity(db.Model):
    __tablename__ = 'activities'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('departments.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(100), nullable=False)  # 'track', 'approve', 'review', 'execute'
    description = db.Column(db.Text)
    required_role = db.Column(db.String(100))
    tier_required = db.Column(db.String(50), default='free')
    config = db.Column(db.JSON, default={})
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'department_id': str(self.department_id),
            'name': self.name,
            'type': self.type,
            'description': self.description,
            'required_role': self.required_role,
            'tier_required': self.tier_required,
            'config': self.config,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
        }