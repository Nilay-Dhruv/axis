from app import db
from datetime import datetime

class Decision(db.Model):
    __tablename__ = 'decisions'

    id          = db.Column(db.Integer, primary_key=True)
    title       = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status      = db.Column(db.String(50), default='open')   # open | decided | deferred
    outcome_id  = db.Column(db.Integer, db.ForeignKey('outcomes.id'), nullable=True)
    decided_at  = db.Column(db.DateTime, nullable=True)
    created_by  = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    options  = db.relationship('DecisionOption', backref='decision', cascade='all, delete-orphan', lazy=True)
    criteria = db.relationship('DecisionCriteria', backref='decision', cascade='all, delete-orphan', lazy=True)


class DecisionOption(db.Model):
    __tablename__ = 'decision_options'

    id          = db.Column(db.Integer, primary_key=True)
    decision_id = db.Column(db.Integer, db.ForeignKey('decisions.id'), nullable=False)
    title       = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_selected = db.Column(db.Boolean, default=False)


class DecisionCriteria(db.Model):
    __tablename__ = 'decision_criteria'

    id          = db.Column(db.Integer, primary_key=True)
    decision_id = db.Column(db.Integer, db.ForeignKey('decisions.id'), nullable=False)
    name        = db.Column(db.String(100), nullable=False)
    weight      = db.Column(db.Float, default=1.0)


class DecisionScore(db.Model):
    __tablename__ = 'decision_scores'

    id          = db.Column(db.Integer, primary_key=True)
    option_id   = db.Column(db.Integer, db.ForeignKey('decision_options.id'), nullable=False)
    criteria_id = db.Column(db.Integer, db.ForeignKey('decision_criteria.id'), nullable=False)
    score       = db.Column(db.Float, default=0)