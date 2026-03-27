from flask import Flask
from flask_cors import CORS
from extensions import db
from routes.service_routes import service_routes
from routes.booking_routes import booking_routes  # make sure booking_routes is correct

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///salon.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for all routes
CORS(app)

db.init_app(app)

# Register blueprints
app.register_blueprint(service_routes)
app.register_blueprint(booking_routes)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # creates tables if they don't exist
    app.run(debug=True, port=5001)