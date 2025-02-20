import functools
import os
from flask import Blueprint, g, render_template, request, url_for, redirect, session, flash
import requests
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

CORREO_USUARIO = os.getenv("CORREO_USUARIO")
CONTRASENA_USUARIO = os.getenv("CONTRASENA_USUARIO")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENTE_SECRET = os.getenv("CLIENTE_SECRET")
END_POINT = os.getenv("END_POINT") 
GRANT_TYPE = os.getenv("GRANT_TYPE")

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        correo = request.form['correo']
        password = request.form['password']

        # Validar el usuario y contraseña
        if correo == CORREO_USUARIO and password == CONTRASENA_USUARIO:
            headers = {
                "Accept": "application/json"
            }
            payload = {
                "grant_type": GRANT_TYPE,
                "client_id": CLIENT_ID,
                "client_secret": CLIENTE_SECRET,
                "username": correo,
                "password": password
            }

            end_point = END_POINT + "/oauth/token"

            response = requests.post(end_point, data=payload, headers=headers)

            if response.status_code == 200:
                token_data = response.json()
                session.clear()
                session['auth'] = True
                session["access_token"] = token_data.get("access_token")
                session["refresh_token"] = token_data.get("refresh_token")

                return redirect(url_for('factus.index'))
            else:
                flash('No se pudo obtener el token de acceso', 'error')
                return redirect(url_for('auth.login'))
        else:
            flash('Correo o contraseña incorrectos', 'error')
            return redirect(url_for('auth.login'))
    return render_template('auth/login.html')

def load_logged_in_user():
    auth = session.get('auth')
    g.user = True if auth else None

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))
        return view(**kwargs)
    return wrapped_view

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))