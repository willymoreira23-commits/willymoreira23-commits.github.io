/* ===========================================================
   script.js — funcionalidades do site (Willy César)
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStarCanvas();
  initCardToggles();
  initDeleteButtons();
  initAddButtons();
  initEditingMode();
  initFilePickers();
  initLyrics();
  initEditLinks();
  initVisitorCounter();
});

/* ---------- fundo com canvas (opcional, decorativo) ---------- */
function initStarCanvas() {
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);
  // O fundo estrelado principal já vem do CSS (background-image do body).
  // O canvas fica só disponível caso queira desenhar algo extra no futuro.
}

/* ---------- abrir / fechar cards (textos, músicas, vídeos) ---------- */
function initCardToggles() {
  document.body.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.toggle-btn');
    if (!toggleBtn) return;
    const card = toggleBtn.closest('.card');
    if (!card) return;
    toggleCard(card);
  });

  // também permite clicar no header (fora dos botões) pra abrir/fechar
  document.body.addEventListener('click', (e) => {
    const header = e.target.closest('.card-header');
    if (!header) return;
    if (e.target.closest('.header-actions')) return; // já tratado acima
    const card = header.closest('.card');
    if (!card) return;
    toggleCard(card);
  });
}

function toggleCard(card) {
  const isCollapsed = card.classList.contains('collapsed');
  if (isCollapsed) {
    card.classList.remove('collapsed');
    card.classList.add('expanded');
  } else {
    card.classList.remove('expanded');
    card.classList.add('collapsed');
  }
}

/* ---------- remover card (modo edição) ---------- */
function initDeleteButtons() {
  document.body.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.del-btn');
    if (!delBtn) return;
    e.stopPropagation();
    const card = delBtn.closest('.card');
    if (!card) return;
    if (confirm('Remover este item?')) {
      card.remove();
    }
  });
}

/* ---------- adicionar novo card ---------- */
function initAddButtons() {
  const addTexto = document.getElementById('addTexto');
  const addMusica = document.getElementById('addMusica');
  const addVideo = document.getElementById('addVideo');

  if (addTexto) addTexto.addEventListener('click', () => addCard('texto'));
  if (addMusica) addMusica.addEventListener('click', () => addCard('musica'));
  if (addVideo) addVideo.addEventListener('click', () => addCard('video'));
}

function addCard(tipo) {
  let list, card;

  if (tipo === 'texto') {
    list = document.getElementById('textos-list');
    card = document.createElement('div');
    card.className = 'card collapsed';
    card.innerHTML = `
      <div class="card-header">
        <h3 class="editable" contenteditable="false">Novo texto</h3>
        <div class="header-actions">
          <button class="del-btn" title="Remover">×</button>
          <button class="toggle-btn" title="Expandir/Recolher">▾</button>
        </div>
      </div>
      <div class="card-body">
        <p class="editable" contenteditable="false">Escreva aqui...</p>
      </div>`;
  } else if (tipo === 'musica') {
    list = document.getElementById('musicas-list');
    card = document.createElement('div');
    card.className = 'card collapsed';
    card.innerHTML = `
      <div class="card-header">
        <h3 class="editable" contenteditable="false">Nova música</h3>
        <div class="header-actions">
          <button class="del-btn" title="Remover">×</button>
          <button class="toggle-btn" title="Expandir/Recolher">▾</button>
        </div>
      </div>
      <div class="card-body">
        <audio controls controlslist="nodownload" oncontextmenu="return false"></audio>
        <div class="filename editable" contenteditable="false">nenhum arquivo selecionado</div>
        <input type="file" class="media-file-input" accept="audio/*" hidden>
        <button class="pick-file-btn">🎵 Escolher música do computador</button>
        <div class="lyrics">
          <p class="lyric-line"><span class="lyric-time editable" contenteditable="false">0:00</span> <span class="lyric-text editable" contenteditable="false">Primeira linha da letra</span></p>
        </div>
        <button class="add-line-btn">+ Nova linha</button>
      </div>`;
  } else {
    list = document.getElementById('videos-list');
    card = document.createElement('div');
    card.className = 'card collapsed';
    card.innerHTML = `
      <div class="card-header">
        <h3 class="editable" contenteditable="false">Novo vídeo</h3>
        <div class="header-actions">
          <button class="del-btn" title="Remover">×</button>
          <button class="toggle-btn" title="Expandir/Recolher">▾</button>
        </div>
      </div>
      <div class="card-body">
        <video controls controlslist="nodownload" oncontextmenu="return false"></video>
        <div class="filename editable" contenteditable="false">nenhum arquivo selecionado</div>
        <input type="file" class="media-file-input" accept="video/*" hidden>
        <button class="pick-file-btn">🎬 Escolher vídeo do computador</button>
      </div>`;
  }

  list.appendChild(card);
  applyEditingState(document.body.classList.contains('editing'));
}

/* ---------- modo de edição ---------- */
function initEditingMode() {
  const fab = document.getElementById('editFab');
  const saveBtn = document.getElementById('saveBtn');

  if (fab) {
    fab.addEventListener('click', () => {
      const editing = !document.body.classList.contains('editing');
      document.body.classList.toggle('editing', editing);
      applyEditingState(editing);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveEdits();
      document.body.classList.remove('editing');
      applyEditingState(false);
      alert('Alterações salvas neste navegador. Lembre-se: para outras pessoas verem as mudanças, é preciso publicar o novo HTML/arquivos no GitHub.');
    });
  }

  // restaura edições salvas anteriormente neste navegador
  loadEdits();
}

function applyEditingState(editing) {
  document.querySelectorAll('.editable').forEach(el => {
    el.setAttribute('contenteditable', editing ? 'true' : 'false');
  });
}

function saveEdits() {
  try {
    const data = {
      textos: document.getElementById('textos-list').innerHTML,
      musicas: document.getElementById('musicas-list').innerHTML,
      videos: document.getElementById('videos-list').innerHTML,
      contatos: document.querySelector('.contact-list')?.innerHTML || ''
    };
    localStorage.setItem('site_edits_v1', JSON.stringify(data));
  } catch (err) {
    console.error('Não foi possível salvar as alterações:', err);
  }
}

function loadEdits() {
  try {
    const raw = localStorage.getItem('site_edits_v1');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.textos) document.getElementById('textos-list').innerHTML = data.textos;
    if (data.musicas) document.getElementById('musicas-list').innerHTML = data.musicas;
    if (data.videos) document.getElementById('videos-list').innerHTML = data.videos;
    if (data.contatos) document.querySelector('.contact-list').innerHTML = data.contatos;
  } catch (err) {
    console.error('Não foi possível carregar alterações salvas:', err);
  }
}

/* ---------- escolher arquivo do computador (foto / música / vídeo) ---------- */
function initFilePickers() {
  document.body.addEventListener('click', (e) => {
    const pickBtn = e.target.closest('.pick-file-btn');
    if (!pickBtn) return;
    e.stopPropagation();
    const container = pickBtn.closest('.profile, .card-body');
    if (!container) return;
    const input = container.querySelector('input[type="file"]');
    if (input) input.click();
  });

  document.body.addEventListener('change', (e) => {
    const input = e.target;
    if (!input.matches('.photo-file-input, .media-file-input')) return;
    const file = input.files && input.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const container = input.closest('.profile, .card-body');
    if (!container) return;

    if (input.classList.contains('photo-file-input')) {
      const img = container.querySelector('.profile-photo');
      if (img) img.src = url;
      const nameEl = container.querySelector('.photo-filename');
      if (nameEl) nameEl.textContent = file.name;
    } else {
      const media = container.querySelector('audio, video');
      if (media) {
        media.src = url;
        media.load();
      }
      const nameEl = container.querySelector('.filename');
      if (nameEl) nameEl.textContent = file.name;

      let hint = container.querySelector('.file-hint');
      const msg = `⚠️ Copie o arquivo "${file.name}" para dentro da pasta do site (na mesma pasta do index.html) antes de publicar, com esse mesmo nome.`;
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'file-hint editable';
        container.insertBefore(hint, container.querySelector('.pick-file-btn'));
      }
      hint.textContent = msg;
    }
  });
}

/* ---------- letras sincronizadas + adicionar linha ---------- */
function initLyrics() {
  document.body.addEventListener('click', (e) => {
    const addLineBtn = e.target.closest('.add-line-btn');
    if (!addLineBtn) return;
    e.stopPropagation();
    const cardBody = addLineBtn.closest('.card-body');
    const lyrics = cardBody.querySelector('.lyrics');
    if (!lyrics) return;
    const editing = document.body.classList.contains('editing');
    const line = document.createElement('p');
    line.className = 'lyric-line';
    line.innerHTML = `<span class="lyric-time editable" contenteditable="${editing}">0:00</span> <span class="lyric-text editable" contenteditable="${editing}">Nova linha</span>`;
    lyrics.appendChild(line);
  });

  // realce da linha atual conforme o áudio toca
  document.querySelectorAll('#musicas-list .card').forEach(card => {
    const audio = card.querySelector('audio');
    const lines = card.querySelectorAll('.lyric-line');
    if (!audio || !lines.length) return;

    audio.addEventListener('timeupdate', () => {
      const current = audio.currentTime;
      let activeLine = null;

      lines.forEach(line => {
        const timeText = line.querySelector('.lyric-time')?.textContent.trim() || '0:00';
        const seconds = parseTimeToSeconds(timeText);
        if (seconds <= current) {
          activeLine = line;
        }
      });

      lines.forEach(l => l.classList.remove('active'));
      if (activeLine) activeLine.classList.add('active');
    });
  });
}

function parseTimeToSeconds(text) {
  const parts = text.split(':').map(p => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/* ---------- editar links de contato ---------- */
function initEditLinks() {
  document.body.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-link-btn');
    if (!editBtn) return;
    e.stopPropagation();
    const item = editBtn.closest('.contact-item');
    const link = item?.querySelector('a');
    if (!link) return;
    const novoLink = prompt('Novo link:', link.getAttribute('href') || '');
    if (novoLink !== null && novoLink.trim() !== '') {
      link.setAttribute('href', novoLink.trim());
    }
  });
}

/* ---------- contador de visitas (local ao navegador) ---------- */
function initVisitorCounter() {
  const span = document.getElementById('visitor-count');
  if (!span) return;
  try {
    let count = parseInt(localStorage.getItem('visitor_count') || '0', 10);
    count += 1;
    localStorage.setItem('visitor_count', String(count));
    span.textContent = count;
  } catch (err) {
    span.textContent = '—';
  }
}
