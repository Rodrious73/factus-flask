from flask import Flask, render_template
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Importar y registrar los Blueprints
    from app.routes.token import token_bp
    from app.routes.auth import auth_bp, load_logged_in_user
    from app.routes.factus import factus_bp
    from app.routes.utils_factura import factus_utils_bp
    from app.routes.factura import factura_bp

    app.register_blueprint(token_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(factus_bp)
    app.before_request(load_logged_in_user)
    app.register_blueprint(factus_utils_bp)
    app.register_blueprint(factura_bp)

    @app.route('/')
    def index():
        return render_template('index.html')

    return app
