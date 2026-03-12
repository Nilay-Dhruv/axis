from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.api_key import ApiKey
from datetime import datetime
import hashlib

api_keys_bp = Blueprint('api_keys', __name__, url_prefix='/api/v1/api-keys')


@api_keys_bp.route('', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def list_keys():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    uid = get_jwt_identity()
    keys = ApiKey.query.filter_by(user_id=uid).order_by(ApiKey.created_at.desc()).all()
    return jsonify({'keys': [_serialize(k) for k in keys]}), 200


@api_keys_bp.route('', methods=['POST'])
@jwt_required()
def create_key():
    data = request.get_json()
    uid = get_jwt_identity()
    raw = ApiKey.generate()
    key_hash = hashlib.sha256(raw.encode()).hexdigest()
    k = ApiKey(
        name=data.get('name', 'My API Key'),
        key_hash=key_hash,
        key_prefix=raw[:12],
        user_id=uid,
        is_active=True
    )
    db.session.add(k)
    db.session.commit()
    return jsonify({'key': _serialize(k), 'raw_key': raw}), 201   # raw_key shown ONCE


@api_keys_bp.route('/<int:key_id>', methods=['DELETE'])
@jwt_required()
def revoke_key(key_id):
    uid = get_jwt_identity()
    k = ApiKey.query.filter_by(id=key_id, user_id=uid).first_or_404()
    db.session.delete(k)
    db.session.commit()
    return jsonify({'message': 'Key revoked'}), 200


@api_keys_bp.route('/<int:key_id>/toggle', methods=['PUT', 'OPTIONS'])
@jwt_required(optional=True)
def toggle_key(key_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    uid = get_jwt_identity()
    k = ApiKey.query.filter_by(id=key_id, user_id=uid).first_or_404()
    k.is_active = not k.is_active
    db.session.commit()
    return jsonify({'is_active': k.is_active}), 200


def _serialize(k: ApiKey) -> dict:
    return {
        'id': k.id, 'name': k.name, 'key_prefix': k.key_prefix,
        'is_active': k.is_active,
        'last_used_at': k.last_used_at.isoformat() if k.last_used_at else None,
        'created_at': k.created_at.isoformat() if k.created_at else None,
    }