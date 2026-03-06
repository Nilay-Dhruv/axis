from app import db
import uuid
from datetime import datetime

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('organizations.id'))
    name = db.Column(db.String(100), nullable=False)
    permissions = db.Column(db.JSON, nullable=False, default={})
    tier_required = db.Column(db.String(50), default='free')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)