from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.cache import cache
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
bcrypt = Bcrypt()
limiter = Limiter(key_func=get_remote_address, default_limits=[])


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    app.config['CACHE_TYPE'] = 'SimpleCache'       # in-memory, no Redis needed
    app.config['CACHE_DEFAULT_TIMEOUT'] = 300   

    # ── Extensions ─────────────────────────────
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)
    mail.init_app(app)
    cache.init_app(app) 

    # ── CORS (allow frontend requests) ─────────
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},  # allow all during development
        supports_credentials=True
    )

    # ── Blueprints ─────────────────────────────

    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")

    from .routes.departments import departments_bp
    app.register_blueprint(departments_bp, url_prefix="/api/v1/departments")

    from .routes.activities import activities_bp
    app.register_blueprint(activities_bp, url_prefix="/api/v1/activities")

    from .routes.outcomes import outcomes_bp
    app.register_blueprint(outcomes_bp, url_prefix="/api/v1/outcomes")

    from .routes.roles import roles_bp
    app.register_blueprint(roles_bp, url_prefix="/api/v1/roles")

    # ✅ Signals routes
    from .routes.signals import signals
    app.register_blueprint(signals, url_prefix="/api/v1/signals")

    # Admin + Search
    from app.routes.search import search_bp
    app.register_blueprint(search_bp)

    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp)

    from app.routes.automations import automations_bp
    app.register_blueprint(automations_bp)

    from app.routes.decisions import decisions_bp
    from app.models.decision import Decision, DecisionOption, DecisionCriteria, DecisionScore
    app.register_blueprint(decisions_bp)

    from app.routes.simulations import simulations_bp
    from app.models.simulation import Simulation, SimulationSnapshot
    app.register_blueprint(simulations_bp)

    from app.routes.webhooks import webhooks_bp
    from app.models.webhook import Webhook, WebhookDelivery
    app.register_blueprint(webhooks_bp)

    from app.routes.api_keys import api_keys_bp
    from app.models.api_key import ApiKey
    app.register_blueprint(api_keys_bp)

    # Also import model so Alembic sees it:
    from app.models.automation import Automation, AutomationRun

    from app.models.audit_log import AuditLog

    # ── Error Handlers ─────────────────────────
    from .middleware.error_handler import register_error_handlers
    register_error_handlers(app)

    return app