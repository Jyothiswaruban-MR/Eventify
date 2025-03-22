document.addEventListener("DOMContentLoaded", function () {
    fetch("header.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const headerContainer = document.getElementById("header-container");
            if (headerContainer) {
                headerContainer.innerHTML = data;
                console.log("Header loaded successfully!");
            } else {
                console.error("Error: #header-container not found in the document.");
            }
        })
        .catch(error => console.error("Error loading header:", error));
});
