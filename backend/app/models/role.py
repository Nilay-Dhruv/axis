from app import db
import uuid
from datetime import datetime

class Role(db.Model):
    __tablename__ = 'roles'

    id              = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('organizations.id'), nullable=False)
    name            = db.Column(db.String(100), nullable=False)
    description     = db.Column(db.Text)
    permissions     = db.Column(db.JSON, default={})
    tier_required   = db.Column(db.String(50), default='free')
    is_default      = db.Column(db.Boolean, default=False)
    is_system       = db.Column(db.Boolean, default=False)   # cannot be deleted
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at      = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = db.relationship('Organization', backref='roles')

    def to_dict(self):
        return {
            'id':              str(self.id),
            'organization_id': str(self.organization_id),
            'name':            self.name,
            'description':     self.description,
            'permissions':     self.permissions,
            'tier_required':   self.tier_required,
            'is_default':      self.is_default,
            'is_system':       self.is_system,
            'created_at':      self.created_at.isoformat(),
            'updated_at':      self.updated_at.isoformat(),
        }