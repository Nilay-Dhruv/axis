from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
bcrypt = Bcrypt()
limiter = Limiter(key_func=get_remote_address, default_limits=['200 per day', '50 per hour'])

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)
    CORS(app, resources={r'/api/*': {'origins': app.config['FRONTEND_URL']}})
    mail.init_app(app)

    # Blueprints
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

    from .routes.departments import departments_bp
    app.register_blueprint(departments_bp, url_prefix='/api/v1/departments')

    from .routes.activities import activities_bp
    app.register_blueprint(activities_bp, url_prefix='/api/v1/activities')

    from .middleware.error_handler import register_error_handlers
    register_error_handlers(app)

    return app