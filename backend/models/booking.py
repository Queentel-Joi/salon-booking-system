from extensions import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    booking_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationship to service (optional, helpful)
    service = db.relationship("Service", backref=db.backref("bookings", lazy=True))

    def __repr__(self):
        return f"<Booking {self.customer_name} for service {self.service_id}>"