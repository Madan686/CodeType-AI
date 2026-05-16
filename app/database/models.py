from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db= SQLAlchemy()

class TypingSession(db.Model):
    id=db.Column(db.Integer, primary_key=True)

    wpm=db.Column(db.Integer, nullable=False)

    accuracy=db.Column(db.Float, nullable=False)

    total_errors=db.Column(db.Integer, nullable=False)

    total_typed=db.Column(db.Integer, nullable=False)

    ghost_data=db.Column(db.Text, nullable=False)

    created_at=db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "wpm": self.wpm,
            "accuracy": self.accuracy,
            "total_errors": self.total_errors,
            "total_typed": self.total_typed,
            "ghost_data": json.loads(self.ghost_data),
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M")
        }
    
class CodeSnippet(db.Model):

    id=db.Column(db.Integer, primary_key=True)

    title=db.Column(db.String(200), nullable=False)

    language=db.Column(db.String(50), nullable=False)

    difficulty=db.Column(db.String(50), nullable=False)

    code=db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "language": self.language,
            "difficulty": self.difficulty,
            "code": self.code
        }