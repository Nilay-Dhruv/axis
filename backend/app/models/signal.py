from app import db
import uuid
from datetime import datetime

class Signal(db.Model):
    __tablename__ = 'signals'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    outcome_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('outcomes.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Numeric(precision=15, scale=2))
    threshold_min = db.Column(db.Numeric(precision=15, scale=2))
    threshold_max = db.Column(db.Numeric(precision=15, scale=2))
    status = db.Column(db.String(50), default='normal')  # 'normal', 'warning', 'critical'
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def calculate_status(self):
        """Auto-calculate status based on thresholds"""
        if self.value is None:
            return 'normal'
        val = float(self.value)
        if self.threshold_min and val < float(self.threshold_min):
            return 'critical'
        if self.threshold_max and val > float(self.threshold_max):
            return 'critical'
        # Warning zone: within 10% of threshold
        if self.threshold_min and val < float(self.threshold_min) * 1.1:
            return 'warning'
        if self.threshold_max and val > float(self.threshold_max) * 0.9:
            return 'warning'
        return 'normal'

    def to_dict(self):
        return {
            'id': str(self.id),
            'outcome_id': str(self.outcome_id),
            'name': self.name,
            'value': float(self.value) if self.value else None,
            'threshold_min': float(self.threshold_min) if self.threshold_min else None,
            'threshold_max': float(self.threshold_max) if self.threshold_max else None,
            'status': self.status,
            'last_updated': self.last_updated.isoformat(),
            'created_at': self.created_at.isoformat(),
        }