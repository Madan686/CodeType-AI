from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Snippet(db.Model):

    __tablename__ = "snippets"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    language = db.Column(
        db.String(50),
        nullable=False
    )

    difficulty = db.Column(
        db.String(50),
        nullable=False
    )

    topic = db.Column(
        db.String(100),
        nullable=False
    )

    code = db.Column(
        db.Text,
        nullable=False
    )


class TypingSession(db.Model):

    __tablename__ = "typing_sessions"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    wpm = db.Column(
        db.Integer,
        nullable=False
    )

    accuracy = db.Column(
        db.Float,
        nullable=False
    )

    total_errors = db.Column(
        db.Integer,
        nullable=False
    )

    total_typed = db.Column(
        db.Integer,
        nullable=False
    )

    language = db.Column(
        db.String(50),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )