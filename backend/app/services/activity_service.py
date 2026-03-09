from app import db
from app.models.activity import Activity
from app.models.activity_log import ActivityLog
from app.models.department import Department
import uuid
from datetime import datetime

# Sample activities seeded per department type
DEPARTMENT_ACTIVITIES = {
    'leadership': [
        {
            'name': 'Review Strategic KPIs',
            'type': 'review',
            'description': 'Quarterly review of organizational key performance indicators',
            'tier_required': 'free',
        },
        {
            'name': 'Approve Department Budgets',
            'type': 'approve',
            'description': 'Review and approve departmental budget allocations',
            'tier_required': 'free',
        },
        {
            'name': 'Executive Decision Log',
            'type': 'track',
            'description': 'Log major executive decisions with context and rationale',
            'tier_required': 'free',
        },
    ],
    'finance': [
        {
            'name': 'Monthly P&L Review',
            'type': 'review',
            'description': 'Review monthly profit and loss statements',
            'tier_required': 'free',
        },
        {
            'name': 'Expense Approval',
            'type': 'approve',
            'description': 'Approve expense reports and purchase orders',
            'tier_required': 'free',
        },
        {
            'name': 'Cash Flow Monitoring',
            'type': 'monitor',
            'description': 'Track and monitor cash flow position',
            'tier_required': 'free',
        },
        {
            'name': 'Financial Forecast Update',
            'type': 'report',
            'description': 'Update quarterly financial forecasts',
            'tier_required': 'basic_premium',
        },
    ],
    'sales': [
        {
            'name': 'Pipeline Review',
            'type': 'review',
            'description': 'Review active sales pipeline and deal stages',
            'tier_required': 'free',
        },
        {
            'name': 'Close Deal',
            'type': 'execute',
            'description': 'Mark deal as closed and log revenue',
            'tier_required': 'free',
        },
        {
            'name': 'Lead Qualification',
            'type': 'track',
            'description': 'Qualify and score incoming leads',
            'tier_required': 'free',
        },
        {
            'name': 'Sales Forecast',
            'type': 'report',
            'description': 'Generate monthly sales forecast report',
            'tier_required': 'basic_premium',
        },
    ],
    'marketing': [
        {
            'name': 'Campaign Performance Review',
            'type': 'review',
            'description': 'Analyze active marketing campaign performance',
            'tier_required': 'free',
        },
        {
            'name': 'Content Approval',
            'type': 'approve',
            'description': 'Approve marketing content before publishing',
            'tier_required': 'free',
        },
        {
            'name': 'Brand Monitoring',
            'type': 'monitor',
            'description': 'Monitor brand mentions and sentiment',
            'tier_required': 'free',
        },
    ],
    'operations': [
        {
            'name': 'Process Audit',
            'type': 'review',
            'description': 'Audit operational processes for efficiency',
            'tier_required': 'free',
        },
        {
            'name': 'Incident Report',
            'type': 'report',
            'description': 'Document and report operational incidents',
            'tier_required': 'free',
        },
        {
            'name': 'SLA Monitoring',
            'type': 'monitor',
            'description': 'Monitor service level agreement compliance',
            'tier_required': 'free',
        },
        {
            'name': 'Vendor Approval',
            'type': 'approve',
            'description': 'Approve new vendor onboarding',
            'tier_required': 'basic_premium',
        },
    ],
    'hr': [
        {
            'name': 'Performance Review',
            'type': 'review',
            'description': 'Conduct employee performance evaluation',
            'tier_required': 'free',
        },
        {
            'name': 'Hiring Approval',
            'type': 'approve',
            'description': 'Approve job requisitions and offers',
            'tier_required': 'free',
        },
        {
            'name': 'Headcount Tracking',
            'type': 'track',
            'description': 'Track headcount against approved budget',
            'tier_required': 'free',
        },
        {
            'name': 'Attrition Monitoring',
            'type': 'monitor',
            'description': 'Monitor employee attrition rates and trends',
            'tier_required': 'basic_premium',
        },
    ],
}


class ActivityService:

    @staticmethod
    def seed_activities_for_department(department: Department) -> list:
        """Seed default activities for a department based on its type"""
        existing = Activity.query.filter_by(department_id=department.id).count()
        if existing > 0:
            return []

        templates = DEPARTMENT_ACTIVITIES.get(department.type, [])
        activities = []

        for tmpl in templates:
            activity = Activity(
                department_id=department.id,
                name=tmpl['name'],
                type=tmpl['type'],
                description=tmpl.get('description'),
                tier_required=tmpl.get('tier_required', 'free'),
                is_active=True,
                config={}
            )
            db.session.add(activity)
            activities.append(activity)

        db.session.commit()
        return activities

    @staticmethod
    def seed_all_departments(organization_id: uuid.UUID) -> int:
        """Seed activities for all departments in an organization"""
        departments = Department.query.filter_by(
            organization_id=organization_id
        ).all()

        total = 0
        for dept in departments:
            seeded = ActivityService.seed_activities_for_department(dept)
            total += len(seeded)

        return total

    @staticmethod
    def get_all(department_id: uuid.UUID = None, organization_id: uuid.UUID = None):
        """Get activities, optionally filtered by department"""
        if department_id:
            return Activity.query.filter_by(
                department_id=department_id,
                is_active=True
            ).order_by(Activity.created_at.asc()).all()

        if organization_id:
            # Get all activities across all departments in org
            return (
                Activity.query
                .join(Department)
                .filter(Department.organization_id == organization_id)
                .filter(Activity.is_active == True)
                .order_by(Activity.created_at.asc())
                .all()
            )
        return []

    @staticmethod
    def get_by_id(activity_id: uuid.UUID):
        return Activity.query.get(activity_id)

    @staticmethod
    def create(
        department_id: uuid.UUID,
        name: str,
        activity_type: str,
        description: str = None,
        required_role: str = None,
        tier_required: str = 'free',
        config: dict = None
    ) -> Activity:
        activity = Activity(
            department_id=department_id,
            name=name,
            type=activity_type,
            description=description,
            required_role=required_role,
            tier_required=tier_required,
            config=config or {},
            is_active=True
        )
        db.session.add(activity)
        db.session.commit()
        return activity

    @staticmethod
    def update(activity: Activity, data: dict) -> Activity:
        allowed = ['name', 'type', 'description', 'required_role',
                   'tier_required', 'config', 'is_active']
        for key in allowed:
            if key in data and data[key] is not None:
                setattr(activity, key, data[key])
        db.session.commit()
        return activity

    @staticmethod
    def delete(activity: Activity):
        # Soft delete — just deactivate
        activity.is_active = False
        db.session.commit()

    @staticmethod
    def execute(
        activity: Activity,
        user_id: uuid.UUID,
        notes: str = None,
        data: dict = None
    ) -> ActivityLog:
        """Execute an activity and create an audit log"""
        log = ActivityLog(
            activity_id=activity.id,
            executed_by=user_id,
            department_id=activity.department_id,
            status='completed',
            notes=notes,
            data=data or {},
            result={
                'executed_at': datetime.utcnow().isoformat(),
                'activity_name': activity.name,
                'activity_type': activity.type,
            }
        )
        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def get_logs(activity_id: uuid.UUID, limit: int = 20) -> list:
        return (
            ActivityLog.query
            .filter_by(activity_id=activity_id)
            .order_by(ActivityLog.executed_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_recent_logs(organization_id: uuid.UUID, limit: int = 10) -> list:
        return (
            ActivityLog.query
            .join(Activity)
            .join(Department)
            .filter(Department.organization_id == organization_id)
            .order_by(ActivityLog.executed_at.desc())
            .limit(limit)
            .all()
        )