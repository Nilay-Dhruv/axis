from app import db
import uuid
from datetime import datetime


class UserRole(db.Model):
    __tablename__ = 'user_roles'

    id              = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'),         nullable=False)
    role_id         = db.Column(db.UUID(as_uuid=True), db.ForeignKey('roles.id'),         nullable=False)
    organization_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('organizations.id'), nullable=False)
    department_id   = db.Column(db.UUID(as_uuid=True), db.ForeignKey('departments.id'),   nullable=True)
    assigned_by     = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'),         nullable=True)
    assigned_at     = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user       = db.relationship('User', foreign_keys=[user_id],   backref='user_roles')
    role       = db.relationship('Role',                            backref='user_roles')
    assigner   = db.relationship('User', foreign_keys=[assigned_by])
    department = db.relationship('Department',                      backref='user_roles')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'role_id', 'organization_id', name='uq_user_role_org'),
    )

    def to_dict(self):
        return {
            'id':              str(self.id),
            'user_id':         str(self.user_id),
            'role_id':         str(self.role_id),
            'organization_id': str(self.organization_id),
            'department_id':   str(self.department_id) if self.department_id else None,
            'assigned_by':     str(self.assigned_by)   if self.assigned_by   else None,
            'assigned_at':     self.assigned_at.isoformat(),
            'role':            self.role.to_dict()      if self.role          else None,
        }