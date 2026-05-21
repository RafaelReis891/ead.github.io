pdfjsLib.GlobalWorkerOptions.workerSrc = "libs/pdf.worker.min.js";

const params = new URLSearchParams(window.location.search);
const moduleId = Number(params.get("id"));

let pdfDoc = null;
let currentPage = 1;

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

/* =========================
   LOAD MODULE
========================= */
async function loadModule() {
  try {
    const response = await fetch("data/modules.json");
    if (!response.ok) throw new Error("Falha ao carregar modules.json");
    
    const modules = await response.json();
    const module = modules.find(m => m.id === moduleId);

    if (!module) {
      alert("Módulo não encontrado");
      return;
    }

    document.getElementById("moduleTitle").innerText = module.title;
    await loadPDF(module.pdf);
    
    // Carrega quiz APENAS se houver perguntas
    if (module.quiz && module.quiz.length > 0) {
      renderQuiz(module);
    } else {
      const container = document.getElementById("quizContainer");
      if (container) {
        container.innerHTML = '<p style="text-align:center;color:#94a3b8">Este módulo não possui quiz.</p>';
      }
    }
  } catch (err) {
    console.error("Erro no loadModule:", err);
  }
}

/* =========================
   PDF
========================= */
async function loadPDF(url) {
  pdfDoc = await pdfjsLib.getDocument(url).promise;
  document.getElementById("pageCount").innerText = pdfDoc.numPages;
  renderPage(currentPage);
}

async function renderPage(num) {
  if (!pdfDoc) return;

  const page = await pdfDoc.getPage(num);
  const container = document.querySelector(".pdf-viewer");

  const viewport = page.getViewport({ scale: 1 });

  const padding = 40;
  const maxWidth = container.clientWidth - padding;
  const maxHeight = container.clientHeight - padding;

  const scaleX = maxWidth / viewport.width;
  const scaleY = maxHeight / viewport.height;
  const scale = Math.min(scaleX, scaleY);

  const scaledViewport = page.getViewport({ scale });

  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  // Render PDF
  await page.render({
    canvasContext: ctx,
    viewport: scaledViewport
  }).promise;

  // REMOVE LINKS ANTIGOS
  document.querySelectorAll(".pdf-link-layer").forEach(el => el.remove());

  // CAMADA DE LINKS
  const linkLayer = document.createElement("div");
  linkLayer.className = "pdf-link-layer";

  linkLayer.style.position = "absolute";
  linkLayer.style.left = canvas.offsetLeft + "px";
  linkLayer.style.top = canvas.offsetTop + "px";
  linkLayer.style.width = canvas.width + "px";
  linkLayer.style.height = canvas.height + "px";
  linkLayer.style.pointerEvents = "none";

  container.appendChild(linkLayer);

  // PEGA LINKS DO PDF
  const annotations = await page.getAnnotations();

  annotations.forEach(annotation => {
    if (annotation.subtype === "Link" && annotation.url) {

      const rect = pdfjsLib.Util.normalizeRect(annotation.rect);

      const x = rect[0] * scale;
      const y = canvas.height - rect[3] * scale;
      const width = (rect[2] - rect[0]) * scale;
      const height = (rect[3] - rect[1]) * scale;

      const link = document.createElement("a");

    link.href = "#";

    link.addEventListener("click", (e) => {
      e.preventDefault();
      openPDFOverlay(annotation.url);
    });

      link.style.position = "absolute";
      link.style.left = `${x}px`;
      link.style.top = `${y}px`;
      link.style.width = `${width}px`;
      link.style.height = `${height}px`;

      link.style.pointerEvents = "auto";

      // DEBUG VISUAL
      // link.style.background = "rgba(255,0,0,0.2)";

      linkLayer.appendChild(link);
    }
  });

  document.getElementById("pageNum").innerText = num;
  document.getElementById("prevPage").disabled = num <= 1;
  document.getElementById("nextPage").disabled = num >= pdfDoc.numPages;
}

/* =========================
   PAGE NAV
========================= */
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage <= 1) return;
  currentPage--;
  renderPage(currentPage);
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (!pdfDoc || currentPage >= pdfDoc.numPages) return;
  currentPage++;
  renderPage(currentPage);
});

document.getElementById("fsPrevPage").addEventListener("click", () => {
  document.getElementById("prevPage").click();
});

document.getElementById("fsNextPage").addEventListener("click", () => {
  document.getElementById("nextPage").click();
});

/* =========================
   FULLSCREEN
========================= */
const fullscreenBtn = document.getElementById("fullscreenBtn");
fullscreenBtn?.addEventListener("click", async () => {
  const viewer = document.querySelector(".pdf-viewer");
  if (!viewer) return;

  if (!document.fullscreenElement) {
    await viewer.requestFullscreen();
    viewer.classList.add("fullscreen");
  } else {
    await document.exitFullscreen();
    viewer.classList.remove("fullscreen");
  }
  renderPage(currentPage);
});

document.addEventListener("fullscreenchange", () => {
  const viewer = document.querySelector(".pdf-viewer");
  if (!document.fullscreenElement && viewer) {
    viewer.classList.remove("fullscreen");
    renderPage(currentPage);
  }
});

/* =========================
   QUIZ (COMPATÍVEL COM module.css)
========================= */
function renderQuiz(module) {
  const container = document.getElementById("quizContainer"); // ← ID corrigido!
  if (!container) return;

  container.innerHTML = ""; // Limpa "Carregando..."

  // Título da seção (opcional, já existe no HTML)
  // container.innerHTML = `<h2 class="quiz-section-title">Quiz do Módulo</h2>`;

  module.quiz.forEach((question, qIndex) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "quiz-question"; // ← Classe do module.css
    questionDiv.dataset.qindex = qIndex;

    // Título da pergunta
    const title = document.createElement("h3");
    title.innerText = `${qIndex + 1}. ${question.question}`;
    questionDiv.appendChild(title);

    // Opções
    const optionsDiv = document.createElement("div");
    optionsDiv.className = "quiz-options"; // ← Classe do module.css

    question.options.forEach((option, oIndex) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option"; // ← Classe do module.css
      btn.dataset.qindex = qIndex;
      btn.dataset.oindex = oIndex; // ← sem espaço!
      btn.innerText = option;
      optionsDiv.appendChild(btn);
    });

    questionDiv.appendChild(optionsDiv);

    // Feedback da questão
    const feedback = document.createElement("div");
    feedback.className = "question-feedback";
    questionDiv.appendChild(feedback);

    container.appendChild(questionDiv);
  });

  // Botão Enviar
  const submitBtn = document.createElement("button");
  submitBtn.className = "quiz-submit"; // ← Classe do module.css
  submitBtn.id = "quizSubmitBtn";
  submitBtn.innerText = "Enviar Resposta";
  container.appendChild(submitBtn);

  // ===== EVENTOS =====

  // Seleção das opções (Event Delegation)
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".quiz-option");
    if (!btn || btn.disabled) return;

    const qIndex = btn.dataset.qindex;
    container.querySelectorAll(`.quiz-option[data-qindex="${qIndex}"]`).forEach(b => {
      b.classList.remove("selected");
      delete b.dataset.selected;
    });
    btn.classList.add("selected");
    btn.dataset.selected = "true";
  });

  // Envio do quiz
  submitBtn.addEventListener("click", () => {
    finishQuiz(module, container, submitBtn);
  });
}

function finishQuiz(module, container, submitBtn) {
  let score = 0;
  const options = container.querySelectorAll(".quiz-option");
  const feedbacks = container.querySelectorAll(".question-feedback");

  // Validação: pelo menos uma questão respondida
  const anySelected = Array.from(options).some(btn => btn.dataset.selected === "true");
  if (!anySelected) {
    alert("Selecione pelo menos uma resposta antes de enviar.");
    return;
  }

  // Desabilita interações
  options.forEach(btn => btn.disabled = true);
  submitBtn.disabled = true;
  submitBtn.textContent = "Corrigindo...";

  // Valida cada questão
  module.quiz.forEach((question, qIndex) => {
    const questionOptions = container.querySelectorAll(`.quiz-option[data-qindex="${qIndex}"]`);
    const feedbackEl = feedbacks[qIndex];
    let userGotItRight = false;
    let userSelected = false;

    questionOptions.forEach(btn => {
      const oIndex = Number(btn.dataset.oindex); // ← sem espaço!
      const isSelected = btn.dataset.selected === "true";
      const isCorrect = oIndex === question.answer;

      if (isSelected) userSelected = true;
      
      // Limpa estados anteriores
      btn.classList.remove("selected", "correct", "wrong");

      // Aplica estados corretos
      if (isCorrect) btn.classList.add("correct");           // Mostra a correta sempre em verde
      if (isSelected && !isCorrect) btn.classList.add("wrong"); // Errada fica vermelha
      if (isSelected && isCorrect) userGotItRight = true;    // Conta como acerto
    });

    if (userGotItRight) score++;

    // Feedback por questão
    if (feedbackEl) {
      feedbackEl.innerHTML = !userSelected
        ? `<span class="feedback-msg wrong-msg">⚠️ Questão não respondida</span>`
        : userGotItRight
          ? `<span class="feedback-msg correct-msg">✅ Você acertou!</span>`
          : `<span class="feedback-msg wrong-msg">❌ Incorreta. A correta está em verde.</span>`;
    }
  });

  // Resultado final
  const percent = Math.round((score / module.quiz.length) * 100);
  const resultBox = document.createElement("div");
  resultBox.className = `result-box ${percent >= 70 ? "result-good" : percent >= 50 ? "result-medium" : "result-bad"}`;
  resultBox.innerHTML = `Você acertou <strong>${score}</strong> de <strong>${module.quiz.length}</strong> (${percent}%)`;
  container.appendChild(resultBox);
  
  submitBtn.textContent = "Quiz Finalizado";
}

function openPDFOverlay(url) {

  const overlay = document.getElementById("pdfOverlay");
  const body = overlay.querySelector(".pdf-overlay-body");

  body.innerHTML = "";

  const lower = url.toLowerCase();

  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".ogg")) {

    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.style.width = "100%";
    video.style.maxHeight = "80vh";
    body.appendChild(video);

  } else if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp")
  ) {

    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    img.style.maxHeight = "80vh";
    img.style.objectFit = "contain";
    body.appendChild(img);

  } else if (lower.includes("youtube.com") || lower.includes("youtu.be")) {

    let embedUrl = url;

    if (lower.includes("youtu.be")) {
      const id = url.split("/").pop();
      embedUrl = `https://www.youtube.com/embed/${id}`;
    }

    if (lower.includes("watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      embedUrl = `https://www.youtube.com/embed/${id}`;
    }

    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.allowFullscreen = true;
    iframe.style.width = "100%";
    iframe.style.height = "80vh";
    iframe.style.border = "none";
    body.appendChild(iframe);

  } else {

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.width = "100%";
    iframe.style.height = "80vh";
    iframe.style.border = "none";
    body.appendChild(iframe);
  }

  overlay.classList.remove("hidden");
  overlay.classList.add("active");
}

function closePDFOverlay() {

  const overlay = document.getElementById("pdfOverlay");
  const body = overlay.querySelector(".pdf-overlay-body");

  overlay.classList.remove("active");
  overlay.classList.add("hidden");

  body.innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.querySelector(".pdf-overlay-close");

  if (btn) {
    btn.addEventListener("click", closePDFOverlay);
  }

});




/* =========================
   INICIALIZAÇÃO
========================= */
document.addEventListener("DOMContentLoaded", loadModule);