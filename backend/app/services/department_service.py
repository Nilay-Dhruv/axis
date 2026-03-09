from app import db
from app.models.department import Department
from app.models.activity import Activity
from app.models.outcome import Outcome
import uuid

# Default 6 departments every organization gets on signup
DEFAULT_DEPARTMENTS = [
    {
        'name': 'Leadership',
        'type': 'leadership',
        'is_default': True,
        'config': {
            'icon': '◆',
            'color': '#00d4ff',
            'description': 'Strategic direction and executive decisions'
        }
    },
    {
        'name': 'Finance',
        'type': 'finance',
        'is_default': True,
        'config': {
            'icon': '◈',
            'color': '#00cc88',
            'description': 'Financial planning, budgeting and reporting'
        }
    },
    {
        'name': 'Sales',
        'type': 'sales',
        'is_default': True,
        'config': {
            'icon': '▲',
            'color': '#ffaa00',
            'description': 'Revenue generation and customer acquisition'
        }
    },
    {
        'name': 'Marketing',
        'type': 'marketing',
        'is_default': True,
        'config': {
            'icon': '◉',
            'color': '#ff6644',
            'description': 'Brand, campaigns and market positioning'
        }
    },
    {
        'name': 'Operations',
        'type': 'operations',
        'is_default': True,
        'config': {
            'icon': '⬟',
            'color': '#8866ff',
            'description': 'Process efficiency and delivery'
        }
    },
    {
        'name': 'Human Resources',
        'type': 'hr',
        'is_default': True,
        'config': {
            'icon': '◐',
            'color': '#ff4488',
            'description': 'People, culture and talent management'
        }
    },
]


class DepartmentService:

    @staticmethod
    def seed_default_departments(organization_id: uuid.UUID, owner_id: uuid.UUID):
        """Create the 6 default departments for a new organization"""
        existing = Department.query.filter_by(
            organization_id=organization_id,
            is_default=True
        ).count()

        if existing > 0:
            return []

        departments = []
        for dept_data in DEFAULT_DEPARTMENTS:
            dept = Department(
                organization_id=organization_id,
                owner_id=owner_id,
                name=dept_data['name'],
                type=dept_data['type'],
                is_default=dept_data['is_default'],
                is_custom=False,
                config=dept_data['config']
            )
            db.session.add(dept)
            departments.append(dept)

        db.session.commit()
        return departments

    @staticmethod
    def get_all(organization_id: uuid.UUID):
        return Department.query.filter_by(
            organization_id=organization_id
        ).order_by(Department.is_default.desc(), Department.created_at.asc()).all()

    @staticmethod
    def get_by_id(department_id: uuid.UUID, organization_id: uuid.UUID):
        return Department.query.filter_by(
            id=department_id,
            organization_id=organization_id
        ).first()

    @staticmethod
    def create(organization_id: uuid.UUID, owner_id: uuid.UUID, name: str, dept_type: str, config: dict):
        # Check custom department limit for free tier (handled in route)
        dept = Department(
            organization_id=organization_id,
            owner_id=owner_id,
            name=name,
            type=dept_type,
            is_default=False,
            is_custom=True,
            config=config or {}
        )
        db.session.add(dept)
        db.session.commit()
        return dept

    @staticmethod
    def update(dept: Department, name: str = None, config: dict = None):
        if name is not None:
            dept.name = name
        if config is not None:
            dept.config = {**dept.config, **config}
        db.session.commit()
        return dept

    @staticmethod
    def delete(dept: Department):
        if dept.is_default:
            return False, 'Cannot delete default departments'
        db.session.delete(dept)
        db.session.commit()
        return True, None

    @staticmethod
    def get_with_activities_and_outcomes(department_id: uuid.UUID, organization_id: uuid.UUID):
        dept = DepartmentService.get_by_id(department_id, organization_id)
        if not dept:
            return None, None, None
        activities = Activity.query.filter_by(department_id=department_id).all()
        outcomes = Outcome.query.filter_by(department_id=department_id).all()
        return dept, activities, outcomes