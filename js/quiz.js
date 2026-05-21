async function loadQuiz() {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    const response = await fetch("data/modules.json");
    if (!response.ok) throw new Error("Falha ao carregar dados");
    
    const modules = await response.json();
    const module = modules.find(m => m.id === id);

    if (!module || !module.quiz) {
      alert("Quiz não encontrado ou inválido.");
      return;
    }

    renderQuiz(module);
  } catch (err) {
    console.error("Erro no loadQuiz:", err);
    alert("Erro ao carregar o quiz. Verifique o console (F12).");
  }
}

function renderQuiz(module) {
  const container = document.getElementById("quizContainer");
  if (!container) return console.error("Elemento #quizContainer não encontrado");

  container.innerHTML = "";
  container.className = "quiz-wrapper";

  // Título
  const title = document.createElement("div");
  title.className = "quiz-title";
  title.innerText = module.title;
  container.appendChild(title);

  // Questões
  module.quiz.forEach((question, index) => {
    const div = document.createElement("div");
    div.className = "question";
    div.dataset.index = index;

    let optionsHTML = "";
    question.options.forEach((option, optIndex) => {
      optionsHTML += `
        <button class="option-btn" data-question="${index}" data-option="${optIndex}">
          ${option}
        </button>
      `;
    });

    div.innerHTML = `
      <div class="question-title">${index + 1}. ${question.question}</div>
      <div class="options">${optionsHTML}</div>
      <div class="question-feedback"></div>
    `;
    container.appendChild(div);
  });

  /* SELEÇÃO - Event Delegation */
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".option-btn");
    if (!btn || btn.disabled) return;

    const qIndex = btn.dataset.question;
    container.querySelectorAll(`.option-btn[data-question="${qIndex}"]`).forEach(b => {
      b.classList.remove("selected");
      delete b.dataset.selected;
    });

    btn.classList.add("selected");
    btn.dataset.selected = "true";
  });

  /* BOTÃO ENVIAR */
  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  actions.innerHTML = `<button class="quiz-submit" id="submitBtn">Enviar Resposta</button>`;
  container.appendChild(actions);

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.addEventListener("click", () => finishQuiz(module));
}

function finishQuiz(module) {
  const submitBtn = document.getElementById("submitBtn");
  let score = 0;

  // Validação: pelo menos uma questão respondida
  const selectedBtns = document.querySelectorAll(".option-btn.selected");
  if (selectedBtns.length === 0) {
    alert("Selecione pelo menos uma resposta antes de enviar.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Corrigindo...";

  module.quiz.forEach((question, index) => {
    const buttons = document.querySelectorAll(`.option-btn[data-question="${index}"]`);
    const feedbackEl = document.querySelector(`.question[data-index="${index}"] .question-feedback`);
    let userGotItRight = false;
    let userSelected = false;

    buttons.forEach(btn => {
      const option = Number(btn.dataset.option);
      const isSelected = btn.dataset.selected === "true";
      const isCorrect = option === question.answer;

      if (isSelected) userSelected = true;
      btn.disabled = true;
      btn.classList.remove("selected", "correct", "wrong");

      if (isCorrect) btn.classList.add("correct");
      if (isSelected && !isCorrect) btn.classList.add("wrong");
      if (isSelected && isCorrect) userGotItRight = true;
    });

    if (userGotItRight) score++;

    if (feedbackEl) {
      if (!userSelected) {
        feedbackEl.innerHTML = `<span class="feedback-msg wrong-msg">⚠️ Questão não respondida</span>`;
      } else {
        feedbackEl.innerHTML = userGotItRight
          ? `<span class="feedback-msg correct-msg">✅ Você acertou!</span>`
          : `<span class="feedback-msg wrong-msg">❌ Incorreta. A resposta correta está em verde.</span>`;
      }
    }
  });

  const percent = Math.round((score / module.quiz.length) * 100);
  let resultClass = "result-bad";
  if (percent >= 70) resultClass = "result-good";
  else if (percent >= 50) resultClass = "result-medium";

  const result = document.createElement("div");
  result.className = `result-box ${resultClass}`;
  result.innerHTML = `
    Você acertou <strong>${score}</strong> de <strong>${module.quiz.length}</strong>
    <br><br>
    Resultado: <strong>${percent}%</strong>
  `;

  document.querySelector(".quiz-wrapper").appendChild(result);
  submitBtn.textContent = "Quiz Finalizado";
}

// Inicia ao carregar a página
document.addEventListener("DOMContentLoaded", loadQuiz);