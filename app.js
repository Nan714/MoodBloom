
// app.js - MoodBloom static app (no external API)
// Features:
// - Save entries to localStorage
// - Auto mood detection (simple keyword-based)
// - Visualize entries as blooms in the garden
// - Export JSON and clear storage
// - Modal to read full entry

const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

const moodInput = qs('#moodInput');
const moodTag = qs('#moodTag');
const saveBtn = qs('#saveBtn');
const garden = qs('#garden');
const exportBtn = qs('#exportBtn');
const clearBtn = qs('#clearBtn');
const modal = qs('#modal');
const modalContent = qs('#modalContent');
const closeModal = qs('#closeModal');

function loadEntries(){ return JSON.parse(localStorage.getItem('moodbloom_entries') || '[]'); }
function saveEntries(list){ localStorage.setItem('moodbloom_entries', JSON.stringify(list)); }

function detectMood(text){
  const t = (text||'').toLowerCase();
  if (!t) return 'neutral';
  if (t.match(/happy|joy|glad|great|love|smile/)) return 'happy';
  if (t.match(/calm|relax|peace|okay|fine/)) return 'calm';
  if (t.match(/sad|sadness|lonely|tear|cry/)) return 'sad';
  if (t.match(/anxious|anxiety|nervous|worried|panic|stress/)) return 'anxious';
  if (t.match(/tired|exhaust|sleep|fatigue/)) return 'tired';
  return 'neutral';
}

function moodMeta(m){
  const map = {
    happy:{color:'#FFF2D9', emoji:'😊', label:'Happy'},
    calm:{color:'#EAFBF0', emoji:'😌', label:'Calm'},
    sad:{color:'#E6F0FF', emoji:'😔', label:'Sad'},
    anxious:{color:'#F6EAFB', emoji:'😟', label:'Anxious'},
    tired:{color:'#FFF5F4', emoji:'😴', label:'Tired'},
    neutral:{color:'#FFFDF9', emoji:'🌱', label:'Neutral'}
  };
  return map[m] || map.neutral;
}

function renderGarden(){
  const list = loadEntries();
  garden.innerHTML = '';
  if (!list.length){ garden.innerHTML = '<div class="note" style="grid-column:1/-1;color:#9b8b8b">No entries yet — write your first bloom.</div>'; return; }
  list.slice().reverse().forEach(entry => {
    const meta = moodMeta(entry.mood);
    const card = document.createElement('div');
    card.className = 'bloom';
    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.style.background = meta.color;
    flower.textContent = meta.emoji;
    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = new Date(entry.date).toLocaleDateString();
    card.appendChild(flower);
    card.appendChild(date);
    card.addEventListener('click', ()=> {
      showModal(`<h3>${meta.emoji} ${meta.label}</h3><p class="meta">${new Date(entry.date).toLocaleString()}</p><div style="white-space:pre-wrap;margin-top:8px">${escapeHtml(entry.text)}</div>`);
    });
    garden.appendChild(card);
  });
}

function showModal(html){
  modalContent.innerHTML = html;
  modal.classList.remove('hidden');
}
function hideModal(){ modal.classList.add('hidden'); }

function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

saveBtn.addEventListener('click', ()=> {
  const text = moodInput.value.trim();
  if (!text){ alert('Write one sentence about your day 🌱'); return; }
  const tag = moodTag.value;
  const mood = tag || detectMood(text);
  const entry = { id: Date.now(), date: new Date().toISOString(), text, mood };
  const list = loadEntries();
  list.push(entry);
  saveEntries(list);
  moodInput.value = '';
  renderGarden();
  // small highlight animation
  const last = garden.firstElementChild;
  if (last) last.animate([{transform:'scale(0.95)'},{transform:'scale(1.02)'},{transform:'scale(1)'}], {duration:700, easing:'ease-out'});
});

exportBtn.addEventListener('click', ()=> {
  const list = loadEntries();
  const blob = new Blob([JSON.stringify(list,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
a.href = url; a.download = 'moodbloom_entries.json'; a.click();
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener('click', ()=> {
  if (confirm('Clear all entries? This cannot be undone.')){
    localStorage.removeItem('moodbloom_entries');
    renderGarden();
  }
});

// modal listeners
closeModal.addEventListener('click', hideModal);
modal.addEventListener('click', (e)=> { if (e.target === modal) hideModal(); });

// initial render
renderGarden();
