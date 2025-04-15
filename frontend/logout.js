document.getElementById("logout").addEventListener("click", function() {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
});
