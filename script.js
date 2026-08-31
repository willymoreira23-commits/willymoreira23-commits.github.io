const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

const numPontos = 60;
const pontos = [];
for (let i = 0; i < numPontos; i++) {
  pontos.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 });
}

function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let p of pontos) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(184, 146, 255, 0.8)';
    ctx.fill();
  }
  for (let i = 0; i < pontos.length; i++) {
    for (let j = i + 1; j < pontos.length; j++) {
      const dx = pontos[i].x - pontos[j].x, dy = pontos[i].y - pontos[j].y;
      const distancia = Math.sqrt(dx * dx + dy * dy);
      if (distancia < 140) {
        ctx.beginPath();
        ctx.moveTo(pontos[i].x, pontos[i].y);
        ctx.lineTo(pontos[j].x, pontos[j].y);
        ctx.strokeStyle = 'rgba(120, 100, 220, ' + (1 - distancia / 140) * 0.3 + ')';
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(desenhar);
}
desenhar();

const body = document.body;
const fab = document.getElementById('editFab');
const saveBtn = document.getElementById('saveBtn');
const addTextoBtn = document.getElementById('addTexto');
const addMusicaBtn = document.getElementById('addMusica');
const addVideoBtn = document.getElementById('addVideo');

function setEditable(on){
  document.querySelectorAll('.editable').forEach(el => el.setAttribute('contenteditable', on ? 'true' : 'false'));
}

fab.addEventListener('click', () => {
  const on = body.classList.toggle('editing');
  setEditable(on);
});

function parseTime(texto){
  const partes = texto.trim().split(':');
  if(partes.length === 2){ return parseInt(partes[0]) * 60 + parseInt(partes[1]); }
  return parseFloat(texto) || 0;
}

// Mostra/atualiza o aviso lembrando de copiar o arquivo escolhido pra pasta do site
function showFileHint(referenceEl, filename){
  let hint = referenceEl.nextElementSibling;
  if(!hint || !hint.classList.contains('file-hint')){
    hint = document.createElement('div');
    hint.className = 'file-hint';
    referenceEl.insertAdjacentElement('afterend', hint);
  }
  hint.textContent = '⚠️ Copie o arquivo "' + filename + '" para dentro da pasta do site (na mesma pasta do index.html) antes de publicar, com esse mesmo nome.';
}

function attachCard(card){
  const delBtn = card.querySelector('.del-btn');
  if(delBtn) delBtn.addEventListener('click', () => card.remove());

  const audio = card.querySelector('audio');
  const lyrics = card.querySelector('.lyrics');
  if(audio && lyrics){
    audio.addEventListener('timeupdate', () => {
      const linhas = lyrics.querySelectorAll('.lyric-line');
      let atual = null;
      linhas.forEach(linha => {
        const tempo = parseTime(linha.querySelector('.lyric-time').textContent);
        linha.classList.remove('active');
        if(audio.currentTime >= tempo){ atual = linha; }
      });
      if(atual){
        atual.classList.add('active');
        atual.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  const addLineBtn = card.querySelector('.add-line-btn');
  if(addLineBtn){
    addLineBtn.addEventListener('click', () => {
      const linha = document.createElement('p');
      linha.className = 'lyric-line';
      linha.innerHTML = '<span class="lyric-time editable" contenteditable="true">0:00</span> <span class="lyric-text editable" contenteditable="true">Nova linha</span>';
      lyrics.appendChild(linha);
    });
  }

  // Botão de escolher música/vídeo do computador
  const pickBtn = card.querySelector('.pick-file-btn');
  const fileInput = card.querySelector('.media-file-input');
  const filenameEl = card.querySelector('.filename');
  const mediaEl = card.querySelector('audio') || card.querySelector('video');

  if(pickBtn && fileInput){
    pickBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if(!file) return;
      const url = URL.createObjectURL(file);
      mediaEl.src = url;
      mediaEl.load();
      if(filenameEl){
        filenameEl.textContent = file.name;
        showFileHint(filenameEl, file.name);
      }
    });
  }
}

document.querySelectorAll('.card').forEach(attachCard);

// Botão de trocar foto de perfil
const photoInput = document.querySelector('.photo-file-input');
const photoPickBtn = document.querySelector('.photo-pick-btn');
const photoFilenameEl = document.querySelector('.photo-filename');
const profilePhoto = document.querySelector('.profile-photo');

if(photoPickBtn && photoInput){
  photoPickBtn.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if(!file) return;
    profilePhoto.src = URL.createObjectURL(file);
    if(photoFilenameEl){
      photoFilenameEl.textContent = file.name;
      showFileHint(photoFilenameEl, file.name);
    }
  });
}

addTextoBtn.addEventListener('click', () => {
  const list = document.getElementById('textos-list');
  const clone = list.querySelector('.card').cloneNode(true);
  clone.querySelector('h3').textContent = 'Novo texto';
  clone.querySelector('p').textContent = 'Escreva aqui.';
  list.appendChild(clone);
  attachCard(clone);
  setEditable(true);
  clone.querySelector('h3').focus();
});

addMusicaBtn.addEventListener('click', () => {
  const list = document.getElementById('musicas-list');
  const clone = list.querySelector('.card').cloneNode(true);
  clone.querySelector('h3').textContent = 'Nova música';
  clone.querySelector('audio').removeAttribute('src');
  clone.querySelector('.filename').textContent = 'novamusica.mp3';
  const oldHint = clone.querySelector('.file-hint');
  if(oldHint) oldHint.remove();
  const fileInput = clone.querySelector('.media-file-input');
  if(fileInput) fileInput.value = '';
  list.appendChild(clone);
  attachCard(clone);
  setEditable(true);
  clone.querySelector('h3').focus();
});

addVideoBtn.addEventListener('click', () => {
  const list = document.getElementById('videos-list');
  const clone = list.querySelector('.card').cloneNode(true);
  clone.querySelector('h3').textContent = 'Novo vídeo';
  clone.querySelector('video').removeAttribute('src');
  clone.querySelector('.filename').textContent = 'novovideo.mp4';
  const oldHint = clone.querySelector('.file-hint');
  if(oldHint) oldHint.remove();
  const fileInput = clone.querySelector('.media-file-input');
  if(fileInput) fileInput.value = '';
  list.appendChild(clone);
  attachCard(clone);
  setEditable(true);
  clone.querySelector('h3').focus();
});

document.querySelectorAll('.edit-link-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const link = btn.previousElementSibling;
    const novo = prompt('Cole o novo link:', link.getAttribute('href'));
    if(novo){ link.setAttribute('href', novo); }
  });
});

document.addEventListener('input', (e) => {
  if(e.target.classList.contains('filename')){
    const card = e.target.closest('.card');
    const media = card.querySelector('audio') || card.querySelector('video');
    if(media){ media.setAttribute('src', e.target.textContent.trim()); }
  }
  if(e.target.classList.contains('photo-filename')){
    document.querySelector('.profile-photo').setAttribute('src', e.target.textContent.trim());
  }
});

// Antes de salvar, troca qualquer "blob:" (pré-visualização temporária) pelo
// nome de arquivo real, pra o HTML salvo funcionar depois de fechar o navegador.
function normalizeForSave(){
  document.querySelectorAll('.card').forEach(card => {
    const filenameEl = card.querySelector('.filename');
    const media = card.querySelector('audio') || card.querySelector('video');
    if(filenameEl && media){
      media.setAttribute('src', filenameEl.textContent.trim());
    }
  });
  if(photoFilenameEl && profilePhoto){
    profilePhoto.setAttribute('src', photoFilenameEl.textContent.trim());
  }
}

saveBtn.addEventListener('click', () => {
  normalizeForSave();
  setEditable(false);
  body.classList.remove('editing');
  const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  const blob = new Blob([html], {type: 'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'index.html';
  a.click();
});