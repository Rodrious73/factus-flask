import requests
from flask import Blueprint, jsonify, request
from app.routes.token import get_token_session 
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

END_POINT = os.getenv("END_POINT") 

factus_utils_bp = Blueprint('utils', __name__, url_prefix='/factus/utils')

@factus_utils_bp.route('/rangos-de-numeracion', methods=['GET'])
def get_rangos_numeracion():
    access_token = get_token_session()
    if not access_token:
        return jsonify({'error': 'No se encontró token de acceso. Inicia sesión para obtener un token.'}), 401

    base_url = f"{END_POINT}/v1/numbering-ranges"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    query_params = {}
    allowed_filters = [
        "filter[id]",
        "filter[document]",
        "filter[resolution_number]",
        "filter[technical_key]",
        "filter[is_active]"
    ]
    for param in allowed_filters:
        value = request.args.get(param)
        if value:
            query_params[param] = value

    response = requests.get(base_url, headers=headers, params=query_params)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({
            "error": "No se pudo obtener los rangos de numeración",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code

@factus_utils_bp.route('/tributos/productos', methods=['GET'])
def get_tributos():
    access_token = get_token_session()
    if not access_token:
        return jsonify({'error': 'Token de acceso no encontrado. Inicia sesión para obtener un token.'}), 401

    base_url = f"{END_POINT}/v1/tributes/products"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    query_params = {}
    name = request.args.get('name')
    if name:
        query_params['name'] = name

    response = requests.get(base_url, headers=headers, params=query_params)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({
            "error": "No se pudo obtener los tributos de productos",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code
    
@factus_utils_bp.route('/unidades-medidas', methods=['GET'])
def get_unidades_de_medida():
    access_token = get_token_session()
    if not access_token:
        return jsonify({'error': 'Token de acceso no encontrado. Inicia sesión para obtener un token.'}), 401

    base_url = f"{END_POINT}/v1/measurement-units"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    query_params = {}
    name = request.args.get('name')
    if name:
        query_params['name'] = name

    response = requests.get(base_url, headers=headers, params=query_params)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({
            "error": "No se pudo obtener las unidades de medida",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code

@factus_utils_bp.route('/municipios', methods=['GET'])
def get_municipios():
    access_token = get_token_session()
    if not access_token:
        return jsonify({'error': 'Token de acceso no encontrado. Inicia sesión para obtener un token.'}), 401

    base_url = f"{END_POINT}/v1/municipalities"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    query_params = {}
    name = request.args.get('name')
    if name:
        query_params['name'] = name

    response = requests.get(base_url, headers=headers, params=query_params)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({
            "error": "No se pudo obtener los municipios",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code

@factus_utils_bp.route('/get-metodos-pago', methods=['GET'])
def get_metodos_pago():
    metodos_pago = [
        {"code": "10", "name": "Efectivo"},
        {"code": "42", "name": "Consignación"},
        {"code": "20", "name": "Cheque"},
        {"code": "47", "name": "Transferencia"},
        {"code": "71", "name": "Bonos"},
        {"code": "72", "name": "Vales"},
        {"code": "1",  "name": "Medio de pago no definido"},
        {"code": "49", "name": "Tarjeta Débito"},
        {"code": "48", "name": "Tarjeta Crédito"},
        {"code": "ZZZ", "name": "Otro*"}
    ]
    
    return jsonify({
        "status": "OK",
        "message": "Solicitud exitosa",
        "data": metodos_pago
    })

@factus_utils_bp.route('/get-tipos-documento', methods=['GET'])
def get_tipos_documento():
    tipos_documento = [
        {"id": 1, "name": "Registro civil"},
        {"id": 2, "name": "Tarjeta de identidad"},
        {"id": 3, "name": "Cédula de ciudadanía"},
        {"id": 4, "name": "Tarjeta de extranjería"},
        {"id": 5, "name": "Cédula de extranjería"},
        {"id": 6, "name": "NIT"},
        {"id": 7, "name": "Pasaporte"},
        {"id": 8, "name": "Documento de identificación extranjero"},
        {"id": 9, "name": "PEP"},
        {"id": 10, "name": "NIT otro país"},
        {"id": 11, "name": "NUIP*"}
    ]
    return jsonify({
        "status": "OK",
        "message": "Solicitud exitosa",
        "data": tipos_documento
    })
