async function loadModules(){

  const response = await fetch("data/modules.json");

  const modules = await response.json();

  return modules;

}

async function renderDashboard(){

  const container = document.getElementById("modulesContainer");

  if(!container) return;

  const modules = await loadModules();

  document.getElementById("moduleCount").innerText =
    `${modules.length}/${modules.length}`;

  modules.forEach(module=>{

    const div = document.createElement("div");

    div.className = "module-card";

    div.innerHTML = `
      <h3>${module.title}</h3>
      <p>${module.description}</p>

      <div class="progress">
        <div class="progress-bar" style="width:${module.progress}%"></div>
      </div>

      <br>

      <a href="module.html?id=${module.id}">
        <button>Abrir</button>
      </a>
    `;

    container.appendChild(div);

  });

}

async function renderModule(){

  const container = document.getElementById("moduleContent");

  if(!container) return;

  const params = new URLSearchParams(window.location.search);

  const id = Number(params.get("id"));

  const modules = await loadModules();

  const module = modules.find(m=>m.id === id);

  container.innerHTML = `
    <h1>${module.title}</h1>

    <br>

    <p>${module.content}</p>

    <br>

    <img src="${module.image}" width="100%">
  `;

  document.getElementById("startQuizBtn")
    .onclick = ()=>{

      window.location.href = `quiz.html?id=${module.id}`;

    };

}

renderDashboard();
renderModule();