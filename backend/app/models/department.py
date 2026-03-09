from app import db
import uuid
from datetime import datetime

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('organizations.id'))
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    is_custom = db.Column(db.Boolean, default=False)
    owner_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    config = db.Column(db.JSON, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    activities = db.relationship('Activity', backref='department', lazy=True, cascade='all, delete-orphan')
    outcomes = db.relationship('Outcome', backref='department', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': str(self.id),
            'organization_id': str(self.organization_id) if self.organization_id else None,
            'name': self.name,
            'type': self.type,
            'is_default': self.is_default,
            'is_custom': self.is_custom,
            'owner_id': str(self.owner_id) if self.owner_id else None,
            'config': self.config or {},
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }