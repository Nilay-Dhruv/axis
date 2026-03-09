from app import db
from app.models.outcome import Outcome
from app.models.signal import Signal
from app.models.department import Department
import uuid
from datetime import datetime

# Sample outcomes seeded per department type
DEPARTMENT_OUTCOMES = {
    'leadership': [
        {
            'name': 'Overall Company Health Score',
            'description': 'Composite score of company-wide KPIs',
            'target_value': 100.0,
            'current_value': 72.0,
            'unit': 'score',
            'signals': [
                {
                    'name': 'Employee Satisfaction',
                    'value': 74.0,
                    'threshold_min': 65.0,
                    'threshold_max': None,
                },
                {
                    'name': 'Strategic Goal Completion',
                    'value': 68.0,
                    'threshold_min': 60.0,
                    'threshold_max': None,
                },
            ],
        },
        {
            'name': 'Decision Velocity',
            'description': 'Average time to make and execute key decisions (days)',
            'target_value': 3.0,
            'current_value': 5.2,
            'unit': 'days',
            'signals': [
                {
                    'name': 'Avg Decision Time',
                    'value': 5.2,
                    'threshold_min': None,
                    'threshold_max': 4.0,
                },
            ],
        },
    ],
    'finance': [
        {
            'name': 'Monthly Revenue',
            'description': 'Total revenue generated this month',
            'target_value': 500000.0,
            'current_value': 423000.0,
            'unit': 'USD',
            'signals': [
                {
                    'name': 'Revenue vs Target',
                    'value': 84.6,
                    'threshold_min': 80.0,
                    'threshold_max': None,
                },
                {
                    'name': 'MoM Growth %',
                    'value': 4.2,
                    'threshold_min': 3.0,
                    'threshold_max': None,
                },
            ],
        },
        {
            'name': 'Operating Cash Flow',
            'description': 'Net cash from operations',
            'target_value': 150000.0,
            'current_value': 98000.0,
            'unit': 'USD',
            'signals': [
                {
                    'name': 'Cash Burn Rate',
                    'value': 52000.0,
                    'threshold_min': None,
                    'threshold_max': 60000.0,
                },
            ],
        },
        {
            'name': 'Gross Margin',
            'description': 'Gross profit as percentage of revenue',
            'target_value': 65.0,
            'current_value': 61.3,
            'unit': '%',
            'signals': [
                {
                    'name': 'Gross Margin %',
                    'value': 61.3,
                    'threshold_min': 58.0,
                    'threshold_max': None,
                },
            ],
        },
    ],
    'sales': [
        {
            'name': 'Monthly Recurring Revenue',
            'description': 'MRR from active subscriptions',
            'target_value': 250000.0,
            'current_value': 187000.0,
            'unit': 'USD',
            'signals': [
                {
                    'name': 'MRR Growth',
                    'value': 6.8,
                    'threshold_min': 5.0,
                    'threshold_max': None,
                },
                {
                    'name': 'Churn Rate %',
                    'value': 2.1,
                    'threshold_min': None,
                    'threshold_max': 3.0,
                },
            ],
        },
        {
            'name': 'Pipeline Value',
            'description': 'Total value of active sales pipeline',
            'target_value': 1200000.0,
            'current_value': 940000.0,
            'unit': 'USD',
            'signals': [
                {
                    'name': 'Pipeline Coverage',
                    'value': 3.8,
                    'threshold_min': 3.0,
                    'threshold_max': None,
                },
            ],
        },
        {
            'name': 'Win Rate',
            'description': 'Percentage of deals closed won',
            'target_value': 35.0,
            'current_value': 28.0,
            'unit': '%',
            'signals': [
                {
                    'name': 'Win Rate %',
                    'value': 28.0,
                    'threshold_min': 25.0,
                    'threshold_max': None,
                },
            ],
        },
    ],
    'marketing': [
        {
            'name': 'Monthly Qualified Leads',
            'description': 'MQLs generated this month',
            'target_value': 500.0,
            'current_value': 342.0,
            'unit': 'leads',
            'signals': [
                {
                    'name': 'Lead Generation Rate',
                    'value': 68.4,
                    'threshold_min': 60.0,
                    'threshold_max': None,
                },
                {
                    'name': 'Cost Per Lead',
                    'value': 42.0,
                    'threshold_min': None,
                    'threshold_max': 60.0,
                },
            ],
        },
        {
            'name': 'Brand Awareness Score',
            'description': 'Composite brand awareness metric',
            'target_value': 80.0,
            'current_value': 63.0,
            'unit': 'score',
            'signals': [
                {
                    'name': 'Share of Voice',
                    'value': 22.0,
                    'threshold_min': 18.0,
                    'threshold_max': None,
                },
            ],
        },
    ],
    'operations': [
        {
            'name': 'Process Efficiency Score',
            'description': 'Overall operational efficiency rating',
            'target_value': 90.0,
            'current_value': 74.0,
            'unit': 'score',
            'signals': [
                {
                    'name': 'On-Time Delivery %',
                    'value': 88.0,
                    'threshold_min': 85.0,
                    'threshold_max': None,
                },
                {
                    'name': 'Error Rate %',
                    'value': 1.8,
                    'threshold_min': None,
                    'threshold_max': 2.5,
                },
            ],
        },
        {
            'name': 'SLA Compliance',
            'description': 'Percentage of SLAs met this period',
            'target_value': 99.0,
            'current_value': 96.4,
            'unit': '%',
            'signals': [
                {
                    'name': 'SLA Breach Count',
                    'value': 4.0,
                    'threshold_min': None,
                    'threshold_max': 5.0,
                },
            ],
        },
    ],
    'hr': [
        {
            'name': 'Employee Retention Rate',
            'description': 'Percentage of employees retained YTD',
            'target_value': 92.0,
            'current_value': 88.5,
            'unit': '%',
            'signals': [
                {
                    'name': 'Monthly Attrition %',
                    'value': 1.4,
                    'threshold_min': None,
                    'threshold_max': 2.0,
                },
                {
                    'name': 'Regrettable Exits',
                    'value': 2.0,
                    'threshold_min': None,
                    'threshold_max': 3.0,
                },
            ],
        },
        {
            'name': 'Time to Hire',
            'description': 'Average days to fill open positions',
            'target_value': 21.0,
            'current_value': 28.0,
            'unit': 'days',
            'signals': [
                {
                    'name': 'Avg Days to Hire',
                    'value': 28.0,
                    'threshold_min': None,
                    'threshold_max': 30.0,
                },
            ],
        },
        {
            'name': 'Employee NPS',
            'description': 'Net promoter score from employee surveys',
            'target_value': 50.0,
            'current_value': 34.0,
            'unit': 'eNPS',
            'signals': [
                {
                    'name': 'eNPS Score',
                    'value': 34.0,
                    'threshold_min': 25.0,
                    'threshold_max': None,
                },
            ],
        },
    ],
}


class OutcomeService:

    @staticmethod
    def seed_outcomes_for_department(department: Department) -> list:
        """Seed default outcomes + signals for a department"""
        existing = Outcome.query.filter_by(
            department_id=department.id
        ).count()
        if existing > 0:
            return []

        templates = DEPARTMENT_OUTCOMES.get(department.type, [])
        outcomes = []

        for tmpl in templates:
            outcome = Outcome(
                department_id=department.id,
                name=tmpl['name'],
                description=tmpl.get('description'),
                target_value=tmpl.get('target_value'),
                current_value=tmpl.get('current_value'),
                unit=tmpl.get('unit'),
                status='active',
            )
            db.session.add(outcome)
            db.session.flush()

            # Seed signals for this outcome
            for sig_data in tmpl.get('signals', []):
                signal = Signal(
                    outcome_id=outcome.id,
                    name=sig_data['name'],
                    value=sig_data.get('value'),
                    threshold_min=sig_data.get('threshold_min'),
                    threshold_max=sig_data.get('threshold_max'),
                )
                signal.status = signal.calculate_status()
                db.session.add(signal)

            outcomes.append(outcome)

        db.session.commit()
        return outcomes

    @staticmethod
    def seed_all_departments(organization_id: uuid.UUID) -> int:
        departments = Department.query.filter_by(
            organization_id=organization_id
        ).all()
        total = 0
        for dept in departments:
            seeded = OutcomeService.seed_outcomes_for_department(dept)
            total += len(seeded)
        return total

    @staticmethod
    def get_all(department_id: uuid.UUID = None, organization_id: uuid.UUID = None):
        if department_id:
            return Outcome.query.filter_by(
                department_id=department_id
            ).order_by(Outcome.created_at.asc()).all()

        if organization_id:
            return (
                Outcome.query
                .join(Department)
                .filter(Department.organization_id == organization_id)
                .order_by(Outcome.created_at.asc())
                .all()
            )
        return []

    @staticmethod
    def get_by_id(outcome_id: uuid.UUID):
        return Outcome.query.get(outcome_id)

    @staticmethod
    def create(
        department_id: uuid.UUID,
        owner_id: uuid.UUID,
        name: str,
        description: str = None,
        target_value: float = None,
        current_value: float = None,
        unit: str = None,
        status: str = 'active',
    ) -> Outcome:
        outcome = Outcome(
            department_id=department_id,
            owner_id=owner_id,
            name=name,
            description=description,
            target_value=target_value,
            current_value=current_value,
            unit=unit,
            status=status,
        )
        db.session.add(outcome)
        db.session.commit()
        return outcome

    @staticmethod
    def update(outcome: Outcome, data: dict) -> Outcome:
        allowed = [
            'name', 'description', 'target_value',
            'current_value', 'unit', 'status'
        ]
        for key in allowed:
            if key in data:
                setattr(outcome, key, data[key])

        # Auto-update status based on progress
        if outcome.target_value and outcome.current_value:
            progress = float(outcome.current_value) / float(outcome.target_value)
            if progress >= 1.0:
                outcome.status = 'achieved'
            elif progress < 0.5:
                outcome.status = 'at_risk'

        db.session.commit()
        return outcome

    @staticmethod
    def delete(outcome: Outcome):
        db.session.delete(outcome)
        db.session.commit()

    @staticmethod
    def get_signals(outcome_id: uuid.UUID) -> list:
        return Signal.query.filter_by(outcome_id=outcome_id).all()

    @staticmethod
    def get_alerts(organization_id: uuid.UUID) -> list:
        """Get all signals in warning or critical state across org"""
        return (
            Signal.query
            .join(Outcome)
            .join(Department)
            .filter(Department.organization_id == organization_id)
            .filter(Signal.status.in_(['warning', 'critical']))
            .order_by(Signal.last_updated.desc())
            .all()
        )

    @staticmethod
    def get_summary(organization_id: uuid.UUID) -> dict:
        """Get outcome health summary for dashboard"""
        outcomes = OutcomeService.get_all(organization_id=organization_id)
        signals = (
            Signal.query
            .join(Outcome)
            .join(Department)
            .filter(Department.organization_id == organization_id)
            .all()
        )

        return {
            'total_outcomes': len(outcomes),
            'achieved': sum(1 for o in outcomes if o.status == 'achieved'),
            'at_risk': sum(1 for o in outcomes if o.status == 'at_risk'),
            'active': sum(1 for o in outcomes if o.status == 'active'),
            'total_signals': len(signals),
            'critical_signals': sum(1 for s in signals if s.status == 'critical'),
            'warning_signals': sum(1 for s in signals if s.status == 'warning'),
            'normal_signals': sum(1 for s in signals if s.status == 'normal'),
        }


class SignalService:

    @staticmethod
    def get_by_id(signal_id: uuid.UUID):
        return Signal.query.get(signal_id)

    @staticmethod
    def create(
        outcome_id: uuid.UUID,
        name: str,
        value: float = None,
        threshold_min: float = None,
        threshold_max: float = None,
    ) -> Signal:
        signal = Signal(
            outcome_id=outcome_id,
            name=name,
            value=value,
            threshold_min=threshold_min,
            threshold_max=threshold_max,
        )
        signal.status = signal.calculate_status()
        db.session.add(signal)
        db.session.commit()
        return signal

    @staticmethod
    def update(signal: Signal, data: dict) -> Signal:
        allowed = ['name', 'value', 'threshold_min', 'threshold_max']
        for key in allowed:
            if key in data:
                setattr(signal, key, data[key])
        signal.status = signal.calculate_status()
        signal.last_updated = datetime.utcnow()
        db.session.commit()
        return signal

    @staticmethod
    def delete(signal: Signal):
        db.session.delete(signal)
        db.session.commit()