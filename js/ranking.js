// ============================================
    // DATA
    // ============================================
    const CURRENT_USER = "Você";

    const ranking = [
      { name: "Rafael",     points: 900,  courses: 14, level: "master"       },
      { name: "Carlos",     points: 780,  courses: 12, level: "master"       },
      { name: "Ana",        points: 720,  courses: 11, level: "advanced"     },
      { name: "João",       points: 650,  courses: 10, level: "advanced"     },
      { name: "Marcos",     points: 580,  courses: 9,  level: "advanced"     },
      { name: "Juliana",    points: 520,  courses: 8,  level: "intermediate" },
      { name: "Fernanda",   points: 480,  courses: 7,  level: "intermediate" },
      { name: "Pedro",      points: 410,  courses: 6,  level: "intermediate" },
      { name: "Lucas",      points: 350,  courses: 5,  level: "beginner"     },
      { name: "Camila",     points: 290,  courses: 4,  level: "beginner"     },
      { name: "Bruno",      points: 240,  courses: 3,  level: "beginner"     },
      { name: "Você",       points: 620,  courses: 9,  level: "advanced", isYou: true },
    ];

    // ============================================
    // HELPERS
    // ============================================
    const avatarColors = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'linear-gradient(135deg, #ec4899, #f43f5e)',
      'linear-gradient(135deg, #f59e0b, #ef4444)',
      'linear-gradient(135deg, #10b981, #06b6d4)',
      'linear-gradient(135deg, #8b5cf6, #d946ef)',
      'linear-gradient(135deg, #f43f5e, #f59e0b)',
      'linear-gradient(135deg, #06b6d4, #3b82f6)',
    ];

    function getAvatarColor(name) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return avatarColors[Math.abs(hash) % avatarColors.length];
    }

    function getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    function getLevelLabel(level) {
      const map = {
        master:       'Mestre',
        advanced:     'Avançado',
        intermediate: 'Intermediário',
        beginner:     'Iniciante'
      };
      return map[level] || level;
    }

    function getLevelClass(level) {
      return `lvl lvl-${level}`;
    }

    function getMedal(index) {
      if (index === 0) return '🥇';
      if (index === 1) return '🥈';
      if (index === 2) return '🥉';
      return '';
    }

    // ============================================
    // SORT
    // ============================================
    ranking.sort((a, b) => b.points - a.points);

    // ============================================
    // STATS
    // ============================================
    const totalPoints = ranking.reduce((s, u) => s + u.points, 0);
    const avgPoints = Math.round(totalPoints / ranking.length);

    animateNumber('totalPlayers', ranking.length);
    animateNumber('totalPoints', totalPoints);
    animateNumber('avgPoints', avgPoints);

    function animateNumber(id, target) {
      const el = document.getElementById(id);
      let current = 0;
      const step = Math.ceil(target / 40);
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current.toLocaleString('pt-BR');
      }, 30);
    }

    // ============================================
    // PODIUM
    // ============================================
    const podiumEl = document.getElementById('podium');

    const top3 = ranking.slice(0, 3);
    const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd

    const podiumClasses = ['second', 'first', 'third'];

    top3.forEach((user, i) => {
      const card = document.createElement('div');
      card.className = `podium-card ${podiumClasses[i]} animate-in`;
      card.style.animationDelay = `${0.3 + i * 0.15}s`;

      const maxPoints = ranking[0].points;
      const progress = Math.round((user.points / maxPoints) * 100);

      card.innerHTML = `
        <div class="podium-rank">${i === 1 ? '👑' : (i === 0 ? '🥈' : '🥉')}</div>
        <div class="podium-avatar" style="background:${getAvatarColor(user.name)}">
          ${getInitials(user.name)}
        </div>
        <div class="podium-name">${user.name}</div>
        <div class="podium-level">${user.courses} cursos · ${getLevelLabel(user.level)}</div>
        <div class="podium-points">${user.points.toLocaleString('pt-BR')}</div>
        <div class="podium-progress">
          <div class="bar" style="width: ${progress}%"></div>
        </div>
      `;

      podiumEl.appendChild(card);
    });

    // ============================================
    // RANKING LIST
    // ============================================
    const listEl = document.getElementById('rankingList');

    ranking.forEach((user, index) => {
      const row = document.createElement('div');
      row.className = 'ranking-row animate-in';
      row.style.animationDelay = `${0.5 + index * 0.05}s`;

      if (user.isYou) row.classList.add('is-you');

      const posClass = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : '';
      const medal = getMedal(index);

      const youBadge = user.isYou ? '<span class="you-badge">VOCÊ</span>' : '';

      row.innerHTML = `
        <div class="pos ${posClass}">${medal || `#${index + 1}`}</div>
        <div class="user-info">
          <div class="user-avatar" style="background:${getAvatarColor(user.name)}">
            ${getInitials(user.name)}
          </div>
          <div class="user-details">
            <div class="user-name">${user.name} ${youBadge}</div>
            <div class="user-meta">${user.courses} cursos concluídos</div>
          </div>
        </div>
        <div class="level-badge">
          <span class="${getLevelClass(user.level)}">${getLevelLabel(user.level)}</span>
        </div>
        <div class="points">
          ${user.points.toLocaleString('pt-BR')}
          <small>pontos</small>
        </div>
      `;

      listEl.appendChild(row);
    });

    // ============================================
    // YOUR POSITION
    // ============================================
    const youEl = document.getElementById('yourPosition');
    const youUser = ranking.find(u => u.isYou);

    if (youUser) {
      const yourIndex = ranking.indexOf(youUser);
      const yourPos = yourIndex + 1;
      const pointsBehind = yourIndex > 0 ? youUser.points - ranking[yourIndex - 1].points : 0;
      const pointsAhead = yourIndex < ranking.length - 1 ? youUser.points - ranking[yourIndex + 1].points : 0;

      youEl.innerHTML = `
        <div class="yp-info">
          <div class="yp-avatar">${getInitials(youUser.name)}</div>
          <div class="yp-text">
            <div class="yp-label">Sua posição</div>
            <div class="yp-name">${youUser.name}</div>
          </div>
        </div>
        <div class="yp-rank">
          <div class="yp-pos">${yourPos}<small>º lugar</small></div>
          <div class="yp-progress-text">
            ${yourIndex > 0 ? `${Math.abs(pointsBehind)} pts atrás do ${ranking[yourIndex - 1].name}` : '🏆 Você está no topo!'}
          </div>
        </div>
      `;
    }

    // ============================================
    // TABS
    // ============================================
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // Aqui você pode filtrar os dados por período
        console.log('Filtro:', tab.dataset.filter);
      });
    });