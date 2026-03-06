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