from app import db
import uuid
from datetime import datetime

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    activity_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('activities.id'), nullable=False)
    executed_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    department_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('departments.id'), nullable=False)
    status = db.Column(db.String(50), default='completed')  # 'completed', 'failed', 'pending'
    notes = db.Column(db.Text)
    data = db.Column(db.JSON, default={})
    result = db.Column(db.JSON, default={})
    executed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'activity_id': str(self.activity_id),
            'executed_by': str(self.executed_by),
            'department_id': str(self.department_id),
            'status': self.status,
            'notes': self.notes,
            'data': self.data,
            'result': self.result,
            'executed_at': self.executed_at.isoformat(),
        }