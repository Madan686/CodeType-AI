from flask import (
    render_template,
    request,
    jsonify
)

from app.database.models import (
    db,
    TypingSession,
    Snippet
)

import random


def register_routes(app):

    @app.route("/")
    def home():

        return render_template("home.html")


    @app.route("/save-session", methods=["POST"])
    def save_session():

        data = request.get_json()

        session = TypingSession(

            wpm=data["wpm"],
            accuracy=data["accuracy"],
            total_errors=data["total_errors"],
            total_typed=data["total_typed"],
            language=data["language"]

        )

        db.session.add(session)

        db.session.commit()

        return jsonify({
            "message": "Session Saved"
        })


    @app.route("/sessions")
    def get_sessions():

        sessions = TypingSession.query.order_by(
            TypingSession.created_at.desc()
        ).all()

        result = []

        for session in sessions:

            result.append({

                "wpm": session.wpm,

                "accuracy": session.accuracy,

                "total_errors": session.total_errors,

                "total_typed": session.total_typed,

                "language": session.language,

                "created_at": session.created_at.strftime(
                    "%Y-%m-%d %H:%M"
                )

            })

        return jsonify(result)


    @app.route("/random-snippet")
    def random_snippet():

        language = request.args.get(
            "language",
            "python"
        )

        snippets = Snippet.query.filter_by(
            language=language
        ).all()

        if not snippets:

            return jsonify({
                "error": "No snippets found"
            }), 400

        snippet = random.choice(snippets)

        return jsonify({

            "language": snippet.language,

            "difficulty": snippet.difficulty,

            "topic": snippet.topic,

            "code": snippet.code

        })