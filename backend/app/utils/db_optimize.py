"""
Query optimization helpers — call these from routes to avoid N+1 queries.
"""
from app import db
from app.models.outcome import Outcome
from app.models.signal import Signal
from app.models.department import Department
from app.models.activity import Activity
from sqlalchemy import func


def get_department_stats_bulk() -> dict:
    """Single query for all department outcome stats — replaces N per-dept queries."""
    rows = db.session.query(
        Outcome.department_id,
        func.count(Outcome.id).label('total'),
        func.avg(Outcome.progress).label('avg_progress'),
        func.sum(
            db.case((Outcome.status == 'at_risk', 1), else_=0)
        ).label('at_risk_count')
    ).group_by(Outcome.department_id).all()

    return {
        row.department_id: {
            'total': row.total,
            'avg_progress': round(float(row.avg_progress or 0), 1),
            'at_risk_count': row.at_risk_count or 0
        }
        for row in rows
    }


def get_signal_status_counts() -> dict:
    """Single query for signal status distribution."""
    rows = db.session.query(
        Signal.status,
        func.count(Signal.id).label('count')
    ).group_by(Signal.status).all()
    return {row.status: row.count for row in rows}


def get_outcome_status_counts() -> dict:
    """Single query for outcome status distribution."""
    rows = db.session.query(
        Outcome.status,
        func.count(Outcome.id).label('count')
    ).group_by(Outcome.status).all()
    return {row.status: row.count for row in rows}


def paginate_query(query, page: int, per_page: int = 20) -> dict:
    """Reusable pagination wrapper."""
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return {
        'items': items,
        'total': total,
        'page': page,
        'pages': max(1, (total + per_page - 1) // per_page),
        'per_page': per_page
    }