import os
from flask import Flask
from flask_cors import CORS
from extensions import db
from routes.service_routes import service_routes
from routes.booking_routes import booking_routes

def create_app():
    app = Flask(__name__)
    
    # Database Configuration
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///salon.db')
    
    # Fix for Render's "postgres://" vs SQLAlchemy's "postgresql://"
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    #Production Stability Fix: Prevents "Connection Reset" errors on Render
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    #Initialize Extensions
    CORS(app)
    db.init_app(app)

    # 4. Register Blueprints
    app.register_blueprint(service_routes)
    app.register_blueprint(booking_routes)

    return app

app = create_app()

# 5. Create Tables on Startup
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    # Local development
    app.run(debug=True, port=5001)
