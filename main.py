from flask import Flask
from app.routes import register_routes
import os

app = Flask(
    __name__,
    template_folder="app/templates",
    static_folder="app/static"
)

register_routes(app)

if __name__ == "__main__":
    app.run(debug=True)