from flask import Flask
from flask_cors import CORS
from extensions import db
from config import Config  # Import your config class
from routes.service_routes import service_routes
from routes.booking_routes import booking_routes

def create_app():
    app = Flask(__name__)
    
    # Load all settings from the Config class
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    app.register_blueprint(service_routes)
    app.register_blueprint(booking_routes)

    return app

app = create_app()

# Create tables on startup
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=5001)
