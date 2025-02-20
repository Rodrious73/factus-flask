// Funcionalidad del modal
const modal = document.getElementById("modalViewFactus");
const closeModal = document.querySelector(".close-modalView");

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// Funcionalidad de las pestañas
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.getAttribute("data-tab")).classList.add("active");
    });
});

document.addEventListener('DOMContentLoaded', () => {
    var loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    // Obtenemos las facturas
    fetch(urlGetFacturas)
        .then(response => response.json())
        .then(data => {
            const facturas = data.data.data;
            loadingModal.hide();
            const tbody = document.querySelector('#facturasTable tbody');
            facturas.forEach(factura => {
                const cliente = factura.names || factura.graphic_representation_name || "";

                const tr = document.createElement('tr');
                tr.innerHTML = `
      <td>${factura.id}</td>
      <td>${factura.number || ""}</td>
      <td>${factura.reference_code || ""}</td>
      <td>${cliente}</td>
      <td>${factura.total}</td>
      <td>${factura.status === 1 ? 'Validada' : 'Sin Validar'}</td>
      <td>${factura.created_at}</td>
      <td>
        <button class="btn-neon-tabla btn-view-factus" data-number="${factura.number}">
          <i class="bi bi-eye-fill"></i>
        </button>
        <button class="btn-neon-tabla btn-download-pdf" data-number="${factura.number}">
          <i class="bi bi-file-earmark-pdf"></i>
        </button>
        <button class="btn-neon-tabla btn-download-xml" data-number="${factura.number}">
          <i class="bi bi-filetype-xml"></i>
        </button>
      </td>
    `;
                tbody.appendChild(tr);
            });

            document.querySelectorAll('.btn-download-pdf').forEach(button => {
                button.addEventListener('click', function () {
                    const number = this.getAttribute('data-number');
                    downloadPDF(number);
                });
            });

            document.querySelectorAll('.btn-download-xml').forEach(button => {
                button.addEventListener('click', function () {
                    const number = this.getAttribute('data-number');
                    downloadXML(number);
                });
            });

            document.querySelectorAll('.btn-view-factus').forEach(button => {
                button.addEventListener('click', function () {
                    const number = this.getAttribute('data-number');
                    viewFactus(number);
                });
            });
        })
        .catch(error => loadingModal.hide(), console.error("Error al obtener las facturas:", error));
});

// Función para descargar el PDF
function downloadPDF(number) {
    var loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    url = `${urlFacturaDownloadPdf}/${number}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK") {
                const pdfBase64 = data.data.pdf_base_64_encoded;
                const byteCharacters = atob(pdfBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);

                loadingModal.hide();

                window.open(blobUrl, '_blank');
            } else {
                loadingModal.hide();

                alert("Error al descargar el PDF");
            }
        })
        .catch(error => {
            console.error("Error al descargar el PDF:", error);
        });
}

// Función para descargar el XML
function downloadXML(number) {
    var loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    const url = `${urlFacturaDownloadXml}/${number}`;
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            loadingModal.hide();
            window.open(blobUrl, '_blank');
        })
        .catch(error => {
            console.error("Error al descargar el XML:", error);
        });
}

// Función para consultar la factura y mostrar el modal
function viewFactus(number) {
    const url = `${urlFacturaView}/${number}`;
    fetch(url)
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                alert(result.error);
                return;
            }
            // Se espera que result tenga { status, message, data }
            populateModal(result.data);
            modal.style.display = "block";
        })
        .catch(error => {
            console.error("Error al obtener la factura:", error);
            alert("Error al obtener la factura.");
        });
}

// Función para cargar los datos en el modal
function populateModal(data) {
    // Datos de la factura (data.bill)
    const bill = data.bill || {};
    document.getElementById("facturaNumber").textContent = bill.number || "N/A";
    document.getElementById("facturaRef").textContent = bill.reference_code || "N/A";
    document.getElementById("facturaStatus").textContent = (bill.status === 1) ? "Validada" : "Sin Validar";
    document.getElementById("facturaTotal").textContent = bill.total || "N/A";
    document.getElementById("facturaFecha").textContent = bill.created_at || "N/A";
    
    if (bill.qr) {
        const qrLink = document.getElementById("facturaQRLink");
        qrLink.innerHTML = "Click";
        qrLink.setAttribute("href", bill.qr);
        qrLink.setAttribute("target", "_blank");
        qrLink.style.cursor = "pointer";
        // Opcional: estilos para que se vea como botón
        qrLink.style.backgroundColor = "#00ff99";
        qrLink.style.color = "#111";
        qrLink.style.padding = "5px 10px";
        qrLink.style.borderRadius = "5px";
        qrLink.style.textDecoration = "none";
    } else {
        document.getElementById("facturaQRLink").textContent = "N/A";
    }

    document.getElementById("facturaQRImage").src = bill.qr_image || "";

    // Datos de la empresa (data.company)
    const company = data.company || {};
    document.getElementById("empresaNombre").textContent = company.company || company.name || "N/A";
    document.getElementById("empresaNit").textContent = company.nit || "N/A";
    document.getElementById("empresaEmail").textContent = company.email || "N/A";
    document.getElementById("empresaTelefono").textContent = company.phone || "N/A";
    document.getElementById("empresaDireccion").textContent = company.direction || "N/A";

    // Datos del cliente (data.customer)
    const customer = data.customer || {};
    document.getElementById("clienteNombre").textContent = customer.names || customer.graphic_representation_name || "N/A";
    document.getElementById("clienteId").textContent = customer.identification || "N/A";
    document.getElementById("clienteEmail").textContent = customer.email || "N/A";
    document.getElementById("clienteTelefono").textContent = customer.phone || "N/A";
    document.getElementById("clienteDireccion").textContent = customer.address || "N/A";

    // Items
    const itemsContainer = document.getElementById("itemsContainer");
    itemsContainer.innerHTML = "";
    if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("section");
            div.innerHTML = `
          <p><strong>Nombre:</strong> ${item.name || ""}</p>
          <p><strong>Cantidad:</strong> ${item.quantity || ""}</p>
          <p><strong>Precio:</strong> ${item.price || ""}</p>
          <p><strong>Total:</strong> ${item.total || ""}</p>
        `;
            itemsContainer.appendChild(div);
        });
    } else {
        itemsContainer.innerHTML = "<p>No hay items.</p>";
    }

    // Tributos (withholding_taxes)
    const tributosContainer = document.getElementById("tributosContainer");
    tributosContainer.innerHTML = "";
    if (data.withholding_taxes && data.withholding_taxes.length > 0) {
        data.withholding_taxes.forEach(tributo => {
            if (tributo.value && tributo.value !== "") {
                const div = document.createElement("div");
                div.classList.add("section");
                div.innerHTML = `<p><strong>${tributo.name}:</strong> ${tributo.value}</p>`;
                tributosContainer.appendChild(div);
            }
        });
    } else {
        tributosContainer.innerHTML = "<p>No hay tributos.</p>";
    }
}
