from flask import Flask
from app.routes import register_routes
from app.database.models import db
import os

app = Flask(
    __name__,
    template_folder="app/templates",
    static_folder="app/static"
)

app.config["SQLALCHEMY_DATABASE_URI"]= "sqlite:///typing.db"
app.config["SQLALCHEMY_TRACK_NOTIFICATIONS"]=False

db.init_app(app)

with app.app_context():
    db.create_all()


register_routes(app)

if __name__ == "__main__":
    app.run(debug=True)