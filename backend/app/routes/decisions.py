from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.decision import Decision, DecisionOption, DecisionCriteria, DecisionScore
from datetime import datetime

decisions_bp = Blueprint('decisions', __name__, url_prefix='/api/v1/decisions')


@decisions_bp.route('', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def list_decisions():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    decisions = Decision.query.order_by(Decision.created_at.desc()).all()
    return jsonify({'decisions': [_serialize(d) for d in decisions]}), 200


@decisions_bp.route('', methods=['POST'])
@jwt_required()
def create_decision():
    data = request.get_json()
    uid = get_jwt_identity()
    d = Decision(
        title=data.get('title'),
        description=data.get('description'),
        status=data.get('status', 'open'),
        outcome_id=data.get('outcome_id'),
        created_by=uid
    )
    db.session.add(d)
    db.session.flush()

    for opt in data.get('options', []):
        db.session.add(DecisionOption(decision_id=d.id, title=opt.get('title'), description=opt.get('description')))
    for crit in data.get('criteria', []):
        db.session.add(DecisionCriteria(decision_id=d.id, name=crit.get('name'), weight=crit.get('weight', 1.0)))

    db.session.commit()
    return jsonify({'decision': _serialize(d)}), 201


@decisions_bp.route('/<int:dec_id>', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_decision(dec_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    d = Decision.query.get_or_404(dec_id)
    scores = DecisionScore.query.join(DecisionOption).filter(DecisionOption.decision_id == dec_id).all()
    return jsonify({
        'decision': _serialize_full(d),
        'scores': [{'option_id': s.option_id, 'criteria_id': s.criteria_id, 'score': s.score} for s in scores]
    }), 200


@decisions_bp.route('/<int:dec_id>', methods=['PUT', 'OPTIONS'])
@jwt_required(optional=True)
def update_decision(dec_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    d = Decision.query.get_or_404(dec_id)
    data = request.get_json()
    for field in ['title', 'description', 'status', 'outcome_id']:
        if field in data:
            setattr(d, field, data[field])
    if data.get('status') == 'decided':
        d.decided_at = datetime.utcnow()
    d.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'decision': _serialize(d)}), 200


@decisions_bp.route('/<int:dec_id>', methods=['DELETE'])
@jwt_required()
def delete_decision(dec_id):
    d = Decision.query.get_or_404(dec_id)
    db.session.delete(d)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200


@decisions_bp.route('/<int:dec_id>/score', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def save_scores(dec_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.get_json()  # [{"option_id": 1, "criteria_id": 2, "score": 4.5}, ...]
    for item in data:
        existing = DecisionScore.query.filter_by(
            option_id=item['option_id'], criteria_id=item['criteria_id']
        ).first()
        if existing:
            existing.score = item['score']
        else:
            db.session.add(DecisionScore(
                option_id=item['option_id'],
                criteria_id=item['criteria_id'],
                score=item['score']
            ))
    db.session.commit()
    return jsonify({'message': 'Scores saved'}), 200


def _serialize(d: Decision) -> dict:
    return {
        'id': d.id, 'title': d.title, 'description': d.description,
        'status': d.status, 'outcome_id': d.outcome_id,
        'option_count': len(d.options), 'criteria_count': len(d.criteria),
        'decided_at': d.decided_at.isoformat() if d.decided_at else None,
        'created_at': d.created_at.isoformat() if d.created_at else None,
    }

def _serialize_full(d: Decision) -> dict:
    base = _serialize(d)
    base['options'] = [{'id': o.id, 'title': o.title, 'description': o.description, 'is_selected': o.is_selected} for o in d.options]
    base['criteria'] = [{'id': c.id, 'name': c.name, 'weight': c.weight} for c in d.criteria]
    return base