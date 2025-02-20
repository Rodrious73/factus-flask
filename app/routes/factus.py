from flask import Blueprint, render_template
from app.routes.auth import login_required

factus_bp = Blueprint('factus', __name__, url_prefix='/factus')

@factus_bp.route('/inicio')
@login_required
def index():
    return render_template('factus/index.html')

@factus_bp.route('/crear-factura')
@login_required
def crear_factura():
    return render_template('factus/crear_factura.html')