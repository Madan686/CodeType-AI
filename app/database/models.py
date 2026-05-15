from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db= SQLAlchemy()

class TypingSession(db.Model):
    id=db.Column(db.Integer, primary_key=True)

    wpm=db.Column(db.Integer, nullable=False)

    accuracy=db.Column(db.Float, nullable=False)

    total_errors=db.Column(db.Integer, nullable=False)

    total_typed=db.Column(db.Integer, nullable=False)

    created_at=db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "wpm": self.wpm,
            "accuracy": self.accuracy,
            "total_errors": self.total_errors,
            "total_typed": self.total_typed,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M")
        }