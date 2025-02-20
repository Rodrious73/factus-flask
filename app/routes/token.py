import os
import requests
from flask import Blueprint, jsonify, session
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

# Obtener las variables de entorno
CORREO_USUARIO = os.getenv("CORREO_USUARIO")
CONTRASENA_USUARIO = os.getenv("CONTRASENA_USUARIO")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENTE_SECRET = os.getenv("CLIENTE_SECRET")
END_POINT = os.getenv("END_POINT") 
GRANT_TYPE = os.getenv("GRANT_TYPE")

token_bp = Blueprint('token', __name__)

end_point = END_POINT + "/oauth/token"

@token_bp.route('/auth/token', methods=['POST'])
def get_token():

    headers = {
        "Accept": "application/json"
    }
    
    payload = {
        "grant_type": GRANT_TYPE,
        "client_id": CLIENT_ID,
        "client_secret": CLIENTE_SECRET,
        "username": CORREO_USUARIO,
        "password": CONTRASENA_USUARIO
    }
    
    response = requests.post(end_point, data=payload, headers=headers)
    
    if response.status_code == 200:
        token_data = response.json()

        session["access_token"] = token_data.get("access_token")
        session["refresh_token"] = token_data.get("refresh_token")

        return jsonify(token_data)
    else:
        return jsonify({
            "error": "No se pudo obtener el token",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code


@token_bp.route('/auth/refresh')
def refresh_token():
    refresh_token_value = session.get("refresh_token")

    if not refresh_token_value:
        return jsonify({"error": "Falta el parámetro refresh_token"}), 400

    headers = {
        "Accept": "application/json"
    }

    payload = {
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENTE_SECRET,
        "refresh_token": refresh_token_value
    }

    response = requests.post(end_point, data=payload, headers=headers)

    if response.status_code == 200:
        token_data = response.json()

        # Guardar los nuevos tokens en la sesión
        session["access_token"] = token_data.get("access_token")
        session["refresh_token"] = token_data.get("refresh_token")

        return jsonify(token_data)

    return jsonify({
        "error": "No se pudo actualizar el token",
        "status_code": response.status_code,
        "response": response.text
    }), response.status_code

def get_token_session():
    access_token = session.get("access_token")
    if not access_token:
        return None
    return access_token