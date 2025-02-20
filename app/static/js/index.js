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
