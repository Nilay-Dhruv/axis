"""
Run this ONCE to clear all sample/test data from the database.
Usage: python clear_data.py  (from backend/ folder with venv active)
"""

import sys
import os

# Add backend root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app import create_app, db
from app.models.user import User
from app.models.department import Department
from app.models.activity import Activity
from app.models.outcome import Outcome
from app.models.signal import Signal
from app.models.audit_log import AuditLog


def clear_all_sample_data():
    app = create_app()

    with app.app_context():
        print("Clearing sample data...")

        # Keep first admin
        admin = User.query.filter_by(role='admin').first()

        # Clear data tables
        # Delete child tables first
        db.session.execute(db.text('DELETE FROM activity_logs'))

        # Then parent tables
        db.session.execute(db.text('DELETE FROM activities'))

        db.session.execute(db.text('DELETE FROM signals'))
        db.session.execute(db.text('DELETE FROM outcomes'))
        db.session.execute(db.text('DELETE FROM audit_logs'))

        # Optional tables
        for table in [
            'automation_runs',
            'automations',
            'decision_scores',
            'decision_criteria',
            'decision_options',
            'decisions',
            'simulation_snapshots',
            'simulations',
            'webhook_deliveries',
            'webhooks',
            'api_keys'
        ]:
            try:
                db.session.execute(db.text(f'DELETE FROM {table}'))
                print(f"  ✓ Cleared {table}")
            except Exception as e:
                db.session.rollback()
                print(f"  - Skipped {table}: {e}")

        db.session.execute(db.text('DELETE FROM departments'))

        # Delete users except admin
        if admin:
            User.query.filter(User.id != admin.id).delete()
            admin.role = 'admin'
            admin.is_active = True
            print(f"  ✓ Kept admin user: {admin.email}")
        else:
            User.query.delete()
            print("  ! No admin found - all users deleted")

        db.session.commit()

        print("\n✅ All sample data cleared.")
        print("   Login with your admin account and start fresh.")


if __name__ == '__main__':
    clear_all_sample_data()