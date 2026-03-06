from app import db
from app.models.user import User
from app.models.organization import Organization
from flask_jwt_extended import create_access_token, create_refresh_token
import uuid

class AuthService:

    @staticmethod
    def register(email, password, full_name, organization_name=None):
        # Check if user already exists
        existing_user = User.query.filter_by(email=email.lower()).first()
        if existing_user:
            return None, "Email already registered"

        # Create organization if name provided
        org = None
        if organization_name:
            org = Organization(name=organization_name)
            db.session.add(org)
            db.session.flush()  # Get org ID before committing

        # Create user
        user = User(
            email=email.lower(),
            full_name=full_name,
            organization_id=org.id if org else None
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return user, None

    @staticmethod
    def login(email, password):
        user = User.query.filter_by(email=email.lower()).first()

        if not user:
            return None, None, "Invalid email or password"

        if not user.is_active:
            return None, None, "Account is deactivated"

        if not user.check_password(password):
            return None, None, "Invalid email or password"

        # Generate tokens
        additional_claims = {
            "email": user.email,
            "organization_id": str(user.organization_id) if user.organization_id else None,
            "subscription_tier": user.subscription_tier,
        }

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(identity=str(user.id))

        return access_token, refresh_token, None

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(uuid.UUID(user_id))