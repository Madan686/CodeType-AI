from flask import (
    render_template,
    request,
    jsonify
)

from app.database.models import (
    db,
    TypingSession,
    CodeSnippet
)

import json
import random

def register_routes(app):

    @app.route("/")
    def home():

        return render_template("home.html")


    @app.route("/save-session", methods=["POST"])
    def save_session():

        data = request.get_json()

        new_session = TypingSession(
            wpm=data["wpm"],
            accuracy=data["accuracy"],
            total_errors=data["total_errors"],
            total_typed=data["total_typed"],
            ghost_data=json.dumps(data["ghost_data"])
        )

        db.session.add(new_session)

        db.session.commit()

        return jsonify({
            "message": "Session saved successfully"
        })


    @app.route("/sessions")
    def get_sessions():

        sessions = TypingSession.query.order_by(
            TypingSession.created_at.desc()
        ).all()

        return jsonify([
            session.to_dict()
            for session in sessions
        ])
    
    @app.route("/random-snippet")
    def random_snippet():

        snippets = CodeSnippet.query.all()
        
        if not snippets:
            return jsonify({
                "message": "No snippets available"
            }), 404

        snippet = random.choice(snippets)

        return jsonify(snippet.to_dict())