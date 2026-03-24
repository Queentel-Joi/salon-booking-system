from flask import Blueprint, jsonify, request
from models import Service
from extensions import db   

service_routes = Blueprint('service_routes', __name__)  # rename here

@service_routes.route('/services', methods=['GET'])
def get_services():
    services = Service.query.all()
    result = []
    for service in services:
        result.append({
            'id': service.id,
            'name': service.name,
            'price': service.price,
            'duration': service.duration
        })
    return jsonify(result)

@service_routes.route('/services', methods=['POST'])
def create_service():
    data = request.get_json()
    new_service = Service(
        name=data['name'],
        price=data['price'],
        duration=data['duration']
    )
    db.session.add(new_service)
    db.session.commit()
    return {"message": "Service created successfully!"}, 201