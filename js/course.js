const params =
  new URLSearchParams(window.location.search);

const courseId =
  Number(params.get("id"));

async function loadCourse(){

  /* CURSOS */

  const coursesResponse =
    await fetch("data/courses.json");

  const courses =
    await coursesResponse.json();

  /* MÓDULOS */

  const modulesResponse =
    await fetch("data/modules.json");

  const modules =
    await modulesResponse.json();

  /* CURSO */

  const course =
    courses.find(c => c.id === courseId);

  if(!course){

    alert("Curso não encontrado");

    return;

  }

  /* MÓDULOS DO CURSO */

  const courseModules =
    modules.filter(
      m => m.courseId === courseId
    );

  /* TOPO */

  document.getElementById("courseTitle")
    .innerText = course.title;

  document.getElementById("courseName")
    .innerText = course.title;

  document.getElementById("courseDescription")
    .innerText = course.description;

  document.getElementById("moduleCount")
    .innerText = courseModules.length;

  /* MOCK PROGRESS */

  document.getElementById("courseProgress")
    .innerText = "72%";

  /* ICON */

  if(course.icon){

    document.getElementById("courseCover")
      .innerText = course.icon;

  }

  /* GRID */

  const grid =
    document.getElementById("modulesGrid");

  grid.innerHTML = "";

  courseModules.forEach((module, index)=>{

    grid.innerHTML += `

      <div class="module-card">

        <div class="module-number">
          ${index + 1}
        </div>

        <h3>
          ${module.title}
        </h3>

        <p>
          ${module.description || "Módulo de treinamento."}
        </p>

        <button
          class="module-btn"
          onclick="
            window.location.href=
            'module.html?id=${module.id}'
          "
        >
          Abrir Módulo
        </button>

      </div>

    `;

  });

}

loadCourse();