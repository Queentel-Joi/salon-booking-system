from flask import Blueprint, request, jsonify
from extensions import db
from models import Booking, Service
from datetime import datetime

booking_routes = Blueprint("booking_routes", __name__)

# CREATE a new booking
@booking_routes.route("/bookings", methods=["POST"])
def create_booking():
    data = request.get_json()

    # Validate required fields
    if not all(key in data for key in ("service_id", "customer_name", "booking_time")):
        return {"error": "Missing required fields"}, 400

    # Validate service exists
    service = Service.query.get(data.get("service_id"))
    if not service:
        return {"error": "Service not found"}, 404

    # Parse booking_time string to datetime
    try:
        booking_time = datetime.strptime(data.get("booking_time"), "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS"}, 400

    # Create booking
    new_booking = Booking(
        service_id=data.get("service_id"),
        customer_name=data.get("customer_name"),
        booking_time=booking_time
    )

    db.session.add(new_booking)
    db.session.commit()

    return {"message": "Booking created successfully!"}, 201

# GET all bookings
@booking_routes.route("/bookings", methods=["GET"])
def get_bookings():
    bookings = Booking.query.all()
    result = []
    for b in bookings:
        result.append({
            "id": b.id,
            "service_id": b.service_id,
            "customer_name": b.customer_name,
            "booking_time": b.booking_time.strftime("%Y-%m-%d %H:%M:%S")
        })
    return jsonify(result), 200

# DELETE a booking
@booking_routes.route("/bookings/<int:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return {"error": "Booking not found"}, 404
    
    db.session.delete(booking)
    db.session.commit()
    
    return {"message": "Booking deleted successfully!"}, 200