# backend/app/models/activity_log.py
from app import db
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    activity_id = db.Column(UUID(as_uuid=True), db.ForeignKey('activities.id'), nullable=False)
    department_id = db.Column(UUID(as_uuid=True), db.ForeignKey('departments.id'), nullable=False)
    executed_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), default='success')  # success | failed | pending
    notes = db.Column(db.Text, nullable=True)
    result_data = db.Column(JSONB, default={})
    executed_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    activity = db.relationship('Activity', backref='logs')
    department = db.relationship('Department', backref='activity_logs')
    executor = db.relationship('User', backref='activity_logs')

    def to_dict(self):
        return {
            'id': str(self.id),
            'activity_id': str(self.activity_id),
            'activity_name': self.activity.name if self.activity else None,
            'department_id': str(self.department_id),
            'department_name': self.department.name if self.department else None,
            'executed_by': str(self.executed_by),
            'executor_name': self.executor.full_name if self.executor else None,
            'status': self.status,
            'notes': self.notes,
            'result_data': self.result_data,
            'executed_at': self.executed_at.isoformat() if self.executed_at else None,
        }