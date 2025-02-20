const paymentForm = document.getElementById('payment_form');
const paymentDueDateGroup = document.getElementById('payment_due_date_group');
const customerIdentificationDocumentId = document.getElementById('customer_identification_document_id');
const customerDvGroup = document.getElementById('customer_dv_group');

paymentForm.addEventListener('change', () => {
    if (paymentForm.value === '2') {
        paymentDueDateGroup.classList.remove('hidden');
    } else {
        paymentDueDateGroup.classList.add('hidden');
    }
});

customerIdentificationDocumentId.addEventListener('change', () => {
    if (customerIdentificationDocumentId.value === '2') {
        customerDvGroup.classList.remove('hidden');
    } else {
        customerDvGroup.classList.add('hidden');
    }
});

document.getElementById('organization_type_id').addEventListener('change', function() {
    const value = this.value;
    const juridicaFields = document.querySelectorAll('.juridica');
    const naturalFields = document.querySelectorAll('.natural');

    if (value === '1') {
        // Muestra campos para Persona Jurídica y oculta los de Persona Natural
        juridicaFields.forEach(el => el.style.display = 'flex');
        naturalFields.forEach(el => el.style.display = 'none');
    } else if (value === '2') {
        // Muestra campos para Persona Natural y oculta los de Persona Jurídica
        naturalFields.forEach(el => el.style.display = 'flex');
        juridicaFields.forEach(el => el.style.display = 'none');
    } else {
        // Ocultar ambos en caso de no haber selección
        juridicaFields.forEach(el => el.style.display = 'none');
        naturalFields.forEach(el => el.style.display = 'none');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Metodos de Pago
    fetch(urlMetodosPago)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK" && Array.isArray(data.data)) {
                const paymentMethodSelect = document.getElementById('payment_method_code');
                // Limpiar y agregar la opción por defecto
                paymentMethodSelect.innerHTML = `<option value="" selected disabled>Seleccione un método de pago</option>`;
                data.data.forEach(metodo => {
                    const option = document.createElement('option');
                    option.value = metodo.code;
                    option.textContent = metodo.name;
                    paymentMethodSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error("Error al cargar métodos de pago:", error));

    // Tipos de Documento de Identificación
    fetch(urlTiposDocumento)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK" && Array.isArray(data.data)) {
                const select = document.getElementById('customer_identification_document_id');
                // Limpiar y agregar opción predeterminada
                select.innerHTML = '<option value="" selected disabled>Seleccione un tipo de documento</option>';
                data.data.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = doc.name;
                    select.appendChild(option);
                });
            }
        })
        .catch(error => console.error("Error al cargar tipos de documento:", error));

    // Unidades de medida
    fetch(urlUnidadesMedida)
        .then(response => response.json())
        .then(data => {
            if (data.data && Array.isArray(data.data)) {
                const prodUnit = document.getElementById('prod_unit');
                prodUnit.innerHTML = `<option value="" selected disabled>Seleccione una unidad</option>`;
                data.data.forEach(unit => {
                    const option = document.createElement('option');
                    option.value = unit.id;
                    option.textContent = `${unit.name} (${unit.code})`;
                    prodUnit.appendChild(option);
                });
            }
        })
        .catch(error => console.error(error));

    // Tributos
    fetch(urlTributos)
        .then(response => response.json())
        .then(data => {
            if (data.data && Array.isArray(data.data)) {
                const prodTributo = document.getElementById('tributos_select');
                prodTributo.innerHTML = `<option value="" selected disabled>Seleccione un tributo</option>`;
                data.data.forEach(tributo => {
                    const option = document.createElement('option');
                    option.value = tributo.id;
                    option.textContent = tributo.name;
                    prodTributo.appendChild(option);
                });
            }
        })
        .catch(error => console.error(error));

    // Rangos de numeración
    fetch(urlRangosNumeracion)
        .then(response => response.json())
        .then(data => {
            if (data.data && Array.isArray(data.data)) {
                const numberingSelect = document.getElementById('numbering_range_id');
                numberingSelect.innerHTML = `<option value="" selected disabled>Seleccione un rango</option>`;
                data.data.forEach(rango => {
                    const option = document.createElement('option');
                    option.value = rango.id;
                    option.text = rango.document;
                    numberingSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error(error));

    // Municipios
    fetch(urlMunicipios)
        .then(response => response.json())
        .then(data => {
            if (data.data && Array.isArray(data.data)) {
                const municipalitySelect = document.getElementById('municipality_select');
                municipalitySelect.innerHTML = `<option value="" selected disabled>Seleccione un municipio</option>`;
                data.data.forEach(municipio => {
                    const option = document.createElement('option');
                    option.value = municipio.id;
                    option.text = municipio.name;
                    municipalitySelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error(error));
});

// Listener para asignar impuesto automático al seleccionar tributo en el bloque de ingreso
document.getElementById('tributos_select').addEventListener('change', function () {
    const selectedText = this.options[this.selectedIndex].text.toLowerCase();
    const taxInput = document.getElementById('prod_tax');
    if (selectedText.includes('iva')) {
        taxInput.value = "19.00";
    } else {
        taxInput.value = "";
    }
});

// Lógica para agregar productos a la tabla
document.getElementById('addProductBtn').addEventListener('click', function () {
    const prodNameEl = document.getElementById('prod_name');
    const prodQuantityEl = document.getElementById('prod_quantity');
    const prodUnitEl = document.getElementById('prod_unit');
    const prodPriceEl = document.getElementById('prod_price');
    const prodTributoEl = document.getElementById('tributos_select');
    const prodDiscountEl = document.getElementById('prod_discount');
    const prodTaxEl = document.getElementById('prod_tax');

    const name = prodNameEl.value.trim();
    const quantity = prodQuantityEl.value;
    const unit = prodUnitEl.value;
    const unitText = prodUnitEl.options[prodUnitEl.selectedIndex].text;
    const price = prodPriceEl.value;
    const tributo = prodTributoEl.value;
    const tributoText = prodTributoEl.options[prodTributoEl.selectedIndex].text;
    const discount = prodDiscountEl.value;
    const tax = prodTaxEl.value;

    if (!name || !quantity || !unit || !price || !tributo) {
        alert("Por favor, complete los campos obligatorios del producto.");
        return;
    }

    const code_reference = name.substring(0, 5);

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td data-name="${name}" data-code-reference="${code_reference}">${name}</td>
        <td data-quantity="${quantity}">${quantity}</td>
        <td data-unit="${unit}">${unitText}</td>
        <td data-price="${price}">${price}</td>
        <td data-tributo="${tributo}">${tributoText}</td>
        <td data-discount="${discount}">${discount || 0}</td>
        <td data-tax="${tax}">${tax || ""}</td>
        <td><button type="button" class="btn btn-danger btn-sm remove-row">Eliminar</button></td>
    `;
    document.querySelector('#productsTable tbody').appendChild(newRow);

    newRow.querySelector('.remove-row').addEventListener('click', function () {
        newRow.remove();
    });

    prodNameEl.value = "";
    prodQuantityEl.value = "";
    prodUnitEl.selectedIndex = 0;
    prodPriceEl.value = "";
    prodTributoEl.selectedIndex = 0;
    prodDiscountEl.value = "";
    prodTaxEl.value = "";
    prodNameEl.focus();
});

// Lógica para enviar la factura 
document.getElementById("generarFactura").addEventListener("submit", function (e) {
    e.preventDefault();

    var loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    const numbering_range_id = document.getElementById('numbering_range_id').value;
    const reference_code = document.getElementById('reference_code').value;
    const observation = document.getElementById('observation').value;
    const payment_form = parseInt(document.getElementById('payment_form').value);
    const payment_due_date = document.getElementById('payment_due_date').value || null;
    const payment_method_code = parseInt(document.getElementById('payment_method_code').value);

    const organization_type_id = parseInt(document.getElementById('organization_type_id').value);
    const customer_company = document.getElementById('customer_company').value;
    const customer_trade_name = document.getElementById('customer_trade_name').value;
    const customer_names = document.getElementById('customer_names').value;
    const customer_identification_document_id = parseInt(document.getElementById('customer_identification_document_id').value);
    const customer_identification = document.getElementById('customer_identification').value;
    const customer_dv = document.getElementById('customer_dv').value || null;
    const customer_address = document.getElementById('customer_address').value;
    const customer_email = document.getElementById('customer_email').value;
    const customer_phone = document.getElementById('customer_phone').value;
    const municipality_id = document.getElementById('municipality_select').value;

    let items = [];
    document.querySelectorAll('#productsTable tbody tr').forEach(function (row) {
        let name = row.querySelector('td:nth-child(1)').dataset.name;
        let code_reference = row.querySelector('td:nth-child(1)').dataset.codeReference;
        let quantity = row.querySelector('td:nth-child(2)').dataset.quantity;
        let unit_measure_id = row.querySelector('td:nth-child(3)').dataset.unit;
        let price = row.querySelector('td:nth-child(4)').dataset.price;
        let tributo = row.querySelector('td:nth-child(5)').dataset.tributo;
        let discount = row.querySelector('td:nth-child(6)').dataset.discount;
        let tax = row.querySelector('td:nth-child(7)').dataset.tax;
        let item = {
            code_reference: code_reference,
            name: name,
            quantity: parseInt(quantity) || 0,
            price: parseFloat(price) || 0,
            discount_rate: parseFloat(discount) || 0,
            tax_rate: tax || "",
            unit_measure_id: parseInt(unit_measure_id),
            standard_code_id: 1,
            is_excluded: 0,
            withholding_taxes: [],
            tribute_id: parseInt(tributo)
        };
        items.push(item);
    });

    let payload = {
        numbering_range_id: numbering_range_id,
        reference_code: reference_code,
        observation: observation,
        //payment_form: payment_form,
        payment_form: payment_form === 1 ? '1' : '2',
        ...(payment_form === 2 && { payment_due_date: payment_due_date }),
        payment_method_code: payment_method_code.toString(),
        customer: {
            identification_document_id: customer_identification_document_id,
            identification: customer_identification,
            dv: customer_dv,
            company: customer_company,
            trade_name: customer_trade_name,
            names: customer_names,
            address: customer_address,
            email: customer_email,
            phone: customer_phone,
            legal_organization_id: organization_type_id,
            tribute_id: 21,
            municipality_id: municipality_id
        },
        items: items
    };

    console.log(JSON.stringify(payload));

    fetch(urlGenerarFactura, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {

            loadingModal.hide();

            window.location.href = urlLocation;
        })
        .catch(error => {

            loadingModal.hide();

            console.error("Error al enviar la factura:", error);
        });

});