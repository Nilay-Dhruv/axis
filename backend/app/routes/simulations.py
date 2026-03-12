from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.simulation import Simulation, SimulationSnapshot
from datetime import datetime
import random

simulations_bp = Blueprint('simulations', __name__, url_prefix='/api/v1/simulations')


@simulations_bp.route('', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def list_simulations():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    sims = Simulation.query.order_by(Simulation.created_at.desc()).all()
    return jsonify({'simulations': [_serialize(s) for s in sims]}), 200


@simulations_bp.route('', methods=['POST'])
@jwt_required()
def create_simulation():
    data = request.get_json()
    uid = get_jwt_identity()
    s = Simulation(
        name=data.get('name'),
        description=data.get('description'),
        parameters=data.get('parameters', {}),
        created_by=uid
    )
    db.session.add(s)
    db.session.commit()
    return jsonify({'simulation': _serialize(s)}), 201


@simulations_bp.route('/<int:sim_id>', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_simulation(sim_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    s = Simulation.query.get_or_404(sim_id)
    return jsonify({
        'simulation': _serialize(s),
        'snapshots': [_serialize_snap(sn) for sn in s.snapshots]
    }), 200


@simulations_bp.route('/<int:sim_id>/run', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def run_simulation(sim_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    s = Simulation.query.get_or_404(sim_id)
    data = request.get_json() or {}
    params = data.get('parameters', s.parameters or {})

    # Simulate result based on parameters
    headcount = params.get('headcount', 10)
    budget = params.get('budget', 100000)
    duration_weeks = params.get('duration_weeks', 12)

    result = {
        'projected_outcomes': round(headcount * 0.8),
        'estimated_cost': round(budget * 0.9),
        'completion_probability': min(99, round(55 + headcount * 2 + (budget / 10000))),
        'risk_score': max(1, round(10 - (headcount * 0.3))),
        'timeline_weeks': duration_weeks,
        'weekly_breakdown': [
            {'week': i + 1, 'progress': round((i + 1) / duration_weeks * 100 + random.uniform(-5, 5))}
            for i in range(min(duration_weeks, 12))
        ]
    }

    snap = SimulationSnapshot(
        simulation_id=s.id,
        label=data.get('label', f'Run {len(s.snapshots) + 1}'),
        parameters=params,
        result=result
    )
    s.status = 'complete'
    s.updated_at = datetime.utcnow()
    db.session.add(snap)
    db.session.commit()
    return jsonify({'snapshot': _serialize_snap(snap)}), 200


@simulations_bp.route('/<int:sim_id>', methods=['DELETE'])
@jwt_required()
def delete_simulation(sim_id):
    s = Simulation.query.get_or_404(sim_id)
    db.session.delete(s)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200


def _serialize(s: Simulation) -> dict:
    return {
        'id': s.id, 'name': s.name, 'description': s.description,
        'status': s.status, 'parameters': s.parameters,
        'snapshot_count': len(s.snapshots),
        'created_at': s.created_at.isoformat() if s.created_at else None,
    }

def _serialize_snap(sn: SimulationSnapshot) -> dict:
    return {
        'id': sn.id, 'simulation_id': sn.simulation_id,
        'label': sn.label, 'parameters': sn.parameters,
        'result': sn.result,
        'created_at': sn.created_at.isoformat() if sn.created_at else None,
    }