from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.models.signal import Signal
from app.models.outcome import Outcome

from datetime import datetime, timedelta

signals = Blueprint("signals", __name__)


@signals.route("/<signal_id>/detail", methods=["GET"])
@jwt_required()
def signal_detail(signal_id):

    signal = Signal.query.filter_by(id=signal_id).first_or_404()
    outcome = Outcome.query.get(signal.outcome_id) if signal.outcome_id else None

    today = datetime.utcnow()
    alert_history = []

    for i in range(13, -1, -1):
        day = today - timedelta(days=i)

        alert_history.append({
            "date": day.strftime("%b %d"),
            "value": float(signal.value or 0) + (i % 5) * (1 if i % 2 == 0 else -1)
        })

    return jsonify({
        "signal": {
            "id": str(signal.id),
            "name": signal.name,
            "status": signal.status,
            "value": float(signal.value) if signal.value else None,

            "threshold_min": float(signal.threshold_min) if signal.threshold_min else None,
            "threshold_max": float(signal.threshold_max) if signal.threshold_max else None,

            "outcome_id": str(signal.outcome_id),
            "outcome_title": outcome.name if outcome else None,

            "last_updated": signal.last_updated.isoformat() if signal.last_updated else None,
            "created_at": signal.created_at.isoformat() if signal.created_at else None,
        },

        "trend": alert_history,

        "alert_count": Signal.query.filter_by(status="critical").count(),
    }), 200