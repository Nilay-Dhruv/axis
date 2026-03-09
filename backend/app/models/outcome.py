from app import db
import uuid
from datetime import datetime

class Outcome(db.Model):
    __tablename__ = 'outcomes'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('departments.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    target_value = db.Column(db.Numeric(precision=15, scale=2))
    current_value = db.Column(db.Numeric(precision=15, scale=2))
    unit = db.Column(db.String(50))
    status = db.Column(db.String(50), default='active')  # 'active', 'achieved', 'at_risk', 'inactive'
    owner_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    signals = db.relationship('Signal', backref='outcome', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': str(self.id),
            'department_id': str(self.department_id),
            'name': self.name,
            'description': self.description,
            'target_value': float(self.target_value) if self.target_value else None,
            'current_value': float(self.current_value) if self.current_value else None,
            'unit': self.unit,
            'status': self.status,
            'owner_id': str(self.owner_id) if self.owner_id else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }