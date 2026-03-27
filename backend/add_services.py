#!/usr/bin/env python3
"""Script to add sample services to the database"""

from app import app
from models import Service
from extensions import db

# Sample services to add
sample_services = [
    {"name": "Hair Styling", "price": 75.00, "duration": 60},
    {"name": "Hair Coloring", "price": 120.00, "duration": 90},
    {"name": "Haircut & Blowdry", "price": 55.00, "duration": 45},
    {"name": "Manicure", "price": 35.00, "duration": 30},
    {"name": "Pedicure", "price": 45.00, "duration": 45},
    {"name": "Gel Nails", "price": 65.00, "duration": 60},
    {"name": "Facial Treatment", "price": 85.00, "duration": 60},
    {"name": "Deep Cleansing Facial", "price": 95.00, "duration": 75},
    {"name": "Swedish Massage", "price": 90.00, "duration": 60},
    {"name": "Deep Tissue Massage", "price": 110.00, "duration": 60},
    {"name": "Makeup Application", "price": 75.00, "duration": 45},
    {"name": "Bridal Makeup", "price": 150.00, "duration": 90},
    {"name": "Eyebrow Threading", "price": 25.00, "duration": 15},
    {"name": "Eyelash Extensions", "price": 120.00, "duration": 90},
    {"name": "Waxing - Full Leg", "price": 55.00, "duration": 45},
    {"name": "Waxing - Underarm", "price": 25.00, "duration": 15},
]

def add_services():
    with app.app_context():
        # Check existing services
        existing_services = Service.query.all()
        existing_names = [s.name for s in existing_services]
        
        print(f"Current services in database: {len(existing_services)}")
        for s in existing_services:
            print(f"  - {s.name}: ${s.price} ({s.duration} min)")
        
        # Add new services
        added_count = 0
        for service_data in sample_services:
            if service_data["name"] not in existing_names:
                new_service = Service(
                    name=service_data["name"],
                    price=service_data["price"],
                    duration=service_data["duration"]
                )
                db.session.add(new_service)
                added_count += 1
                print(f"Added: {service_data['name']}")
        
        if added_count > 0:
            db.session.commit()
            print(f"\nSuccessfully added {added_count} new services!")
        else:
            print("\nNo new services to add (all already exist).")
        
        # Show final count
        final_services = Service.query.all()
        print(f"\nTotal services in database: {len(final_services)}")

if __name__ == "__main__":
    add_services()
