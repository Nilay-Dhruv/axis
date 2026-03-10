# backend/app/routes/search.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.department import Department
from app.models.outcome import Outcome
from app.models.signal import Signal
from app.models.activity import Activity

search_bp = Blueprint('search', __name__, url_prefix='/api/v1/search')

@search_bp.route('', methods=['GET'])
@jwt_required()
def global_search():
    q = request.args.get('q', '').strip()
    if len(q) < 2:
        return jsonify({'results': [], 'total': 0}), 200

    pattern = f'%{q}%'
    results = []

    depts = Department.query.filter(Department.name.ilike(pattern)).limit(5).all()
    for d in depts:
        results.append({'type': 'department', 'id': d.id, 'title': d.name,
                        'subtitle': d.description or 'Department', 'url': f'/departments/{d.id}'})

    outcomes = Outcome.query.filter(Outcome.title.ilike(pattern)).limit(5).all()
    for o in outcomes:
        results.append({'type': 'outcome', 'id': o.id, 'title': o.title,
                        'subtitle': f'Status: {o.status}', 'url': f'/outcomes/{o.id}'})

    signals = Signal.query.filter(Signal.name.ilike(pattern)).limit(5).all()
    for s in signals:
        results.append({'type': 'signal', 'id': s.id, 'title': s.name,
                        'subtitle': f'Status: {s.status}', 'url': f'/signals/{s.id}'})

    activities = Activity.query.filter(Activity.title.ilike(pattern)).limit(5).all()
    for a in activities:
        results.append({'type': 'activity', 'id': a.id, 'title': a.title,
                        'subtitle': f'Status: {a.status}', 'url': f'/activities'})

    return jsonify({'results': results, 'total': len(results)}), 200