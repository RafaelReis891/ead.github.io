const form = document.getElementById("loginForm");

if(form){

  form.addEventListener("submit", (e)=>{

    e.preventDefault();

    const name = document.getElementById("name").value;

    localStorage.setItem("user", name);

    window.location.href = "dashboard.html";

  });

}