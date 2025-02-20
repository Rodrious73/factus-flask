document.getElementById("refreshTokenBtn").addEventListener("click", function(event) {
    event.preventDefault();

    // Mostrar el modal de carga
    let modal = new bootstrap.Modal(document.getElementById("loadingModal"));
    document.getElementById("loadingContent").classList.remove("d-none");
    document.getElementById("resultContent").classList.add("d-none");
    modal.show();

    // Realizar la solicitud para actualizar el token
    fetch(urlRefreshToken)
    .then(response => response.json())
    .then(data => {
        // Ocultar la sección de carga y mostrar el resultado
        document.getElementById("loadingContent").classList.add("d-none");
        document.getElementById("resultContent").classList.remove("d-none");

        let resultIcon = document.getElementById("resultIcon");
        let resultMessage = document.getElementById("resultMessage");

        if (data.access_token) {
            resultIcon.className = "bi bi-check-circle text-success fs-1"; // Icono de éxito
            resultMessage.textContent = "Token actualizado con éxito.";
        } else {
            resultIcon.className = "bi bi-x-circle text-danger fs-1"; // Icono de error
            resultMessage.textContent = "Error al actualizar el token: " + data.error;
        }

        // Cerrar el modal después de 2 segundos
        setTimeout(() => modal.hide(), 2000);

        location.reload();
    })
    .catch(error => {
        // Manejar error y mostrar mensaje
        document.getElementById("loadingContent").classList.add("d-none");
        document.getElementById("resultContent").classList.remove("d-none");

        document.getElementById("resultIcon").className = "bi bi-x-circle text-danger fs-1";
        document.getElementById("resultMessage").textContent = "Error en la solicitud: " + error;

        setTimeout(() => modal.hide(), 2000);
    });
});