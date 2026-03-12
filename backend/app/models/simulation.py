from app import db
from datetime import datetime

class Simulation(db.Model):
    __tablename__ = 'simulations'

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status      = db.Column(db.String(50), default='draft')   # draft | running | complete
    parameters  = db.Column(db.JSON, nullable=True)
    created_by  = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    snapshots = db.relationship('SimulationSnapshot', backref='simulation', cascade='all, delete-orphan', lazy=True)


class SimulationSnapshot(db.Model):
    __tablename__ = 'simulation_snapshots'

    id            = db.Column(db.Integer, primary_key=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulations.id'), nullable=False)
    label         = db.Column(db.String(100), nullable=True)
    parameters    = db.Column(db.JSON, nullable=True)
    result        = db.Column(db.JSON, nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)