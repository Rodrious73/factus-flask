import base64
import requests
from flask import Blueprint, jsonify, request, Response
from app.routes.token import get_token_session  
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

END_POINT = os.getenv("END_POINT") 

factura_bp = Blueprint('factura', __name__, url_prefix='/factus/factura')

@factura_bp.route('/generar', methods=['POST'])
def generar_factura():
    token = get_token_session()
    if not token:
        return jsonify({"error": "Token de acceso no encontrado. Inicia sesión para obtener un token."}), 401

    payload = request.get_json()

    if "items" in payload and isinstance(payload["items"], list):
        for item in payload["items"]:
            if "code_reference" not in item:
                item["code_reference"] = item.get("name", "")[:5]
            if "standard_code_id" not in item:
                item["standard_code_id"] = 1
            if "is_excluded" not in item:
                item["is_excluded"] = 0
            if "withholding_taxes" not in item:
                item["withholding_taxes"] = []


    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    url = END_POINT + "/v1/bills/validate"

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({
            "error": "No se pudo crear la factura",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code

@factura_bp.route('ver-facturas/', methods=['GET'])
def get_facturas():
    token = get_token_session()
    if not token:
        return jsonify({"error": "Token de acceso no encontrado. Inicia sesión para obtener un token."}), 401

    # Recoger otros filtros si se envían
    params = {}
    allowed_filters = [
        "filter[identification]",
        "filter[names]",
        "filter[number]",
        "filter[prefix]",
        "filter[reference_code]",
        "filter[status]"
    ]
    for key in allowed_filters:
        value = request.args.get(key)
        if value:
            params[key] = value

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    url = END_POINT + "/v1/bills"

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        # Filtrar las facturas cuyo reference_code contenga "rodrious" (insensible a mayúsculas)
        if "data" in data and "data" in data["data"]:
            facturas = data["data"]["data"]
            facturas_filtradas = [f for f in facturas if "rodrious" in (f.get("reference_code") or "").lower()]
            data["data"]["data"] = facturas_filtradas
        return jsonify(data), 200
    else:
        return jsonify({
            "error": "No se pudieron traer las facturas",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code
    
@factura_bp.route('/download-pdf/<number>', methods=['GET'])
def download_pdf(number):
    token = get_token_session()
    if not token:
        return jsonify({"error": "Token de acceso no encontrado. Inicia sesión para obtener un token."}), 401

    url = f"{END_POINT}/v1/bills/download-pdf/{number}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({
            "error": "No se pudo descargar el PDF",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code
    

@factura_bp.route('/download-xml/<number>', methods=['GET'])
def download_xml(number):
    token = get_token_session()
    if not token:
        return jsonify({"error": "Token de acceso no encontrado. Inicia sesión para obtener un token."}), 401

    url = f"{END_POINT}/v1/bills/download-xml/{number}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    
    # Realizar la solicitud GET al endpoint de Factus
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("status") == "OK":
            xml_base64 = data["data"].get("xml_base_64_encoded", "")
            file_name = data["data"].get("file_name", "factura") + ".xml"
            # Decodificar la cadena Base64 para obtener los bytes del XML
            xml_bytes = base64.b64decode(xml_base64)
            # Retornar el XML como un archivo descargable
            return Response(xml_bytes, mimetype='application/xml', headers={
                "Content-Disposition": f"attachment; filename={file_name}"
            })
        else:
            return jsonify(data), 200
    else:
        return jsonify({
            "error": "No se pudo descargar el XML",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code

@factura_bp.route('/ver-factura/<number>', methods=['GET'])
def ver_factura(number):
    token = get_token_session()
    if not token:
        return jsonify({"error": "Token de acceso no encontrado. Inicia sesión para obtener un token."}), 401

    url = f"{END_POINT}/v1/bills/show/{number}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        print(response.json())
        return jsonify(response.json()), 200
    else:
        return jsonify({
            "error": "No se pudo obtener la factura",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code
