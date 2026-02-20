import './style.css'

// --- CONFIGURACIÓN DE APIS (GRATUITO) ---
const GEMINI_API_KEY = ''; // Se requiere configurar para producción

// --- ESTADO GLOBAL ---
const state = {
  activeArea: 'global',
  books: [
    '1izhN64cPrZJv-NOq3UY1TqT0YVihMkXRNchLQBKfBTo',
    '1GuQ-yMKzfwOw0jxztms-Kc9uRHzR0p9V-VpxtzyRtw0',
    '1-eWNPFBp2uJ_pxcGuaw_yO1yVa-2xALtpY4I0MOS5dM',
    '1rQvgfORFYiL0tL6O1EcTgC0yB6G_pp5Er94kHjLz-9M',
    '1O86Iycv-BXDEZSP2dtfnNRR4b8IiF-gPFMSMfn6gRnY'
  ],
  adminEmails: ['rordoneza@unemi.edu.ec', 'antoniooz1991@gmail.com'],
  currentUser: null,
  data: [],
  areas: new Set(['Despacho', 'Ventas', 'Almacén', 'Logística'])
}

// --- CONFIGURACIÓN DE SEGURIDAD ---
function handleCredentialResponse(response) {
  const payload = decodeJwt(response.credential);
  state.currentUser = payload.email;

  const isAuthorized = state.adminEmails.includes(state.currentUser) ||
    checkExtraPermissions(state.currentUser);

  if (isAuthorized) {
    document.querySelector('#google-login-container').style.display = 'none';
    document.querySelector('#user-info').textContent = `Conectado: ${payload.name}`;
    loadData();
  } else {
    alert('Acceso Denegado: Solo personal autorizado.');
    google.accounts.id.disableAutoSelect();
  }
}

function decodeJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(window.atob(base64));
}

function checkExtraPermissions(email) {
  const authorized = JSON.parse(localStorage.getItem('authorized_emails') || '[]');
  return authorized.includes(email);
}

// --- SELECTORES ---
const areaList = document.querySelector('#area-list');
const currentTitle = document.querySelector('#current-area-title');
const btnConfig = document.querySelector('#btn-config');
const modalConfig = document.querySelector('#modal-config');
const closeModal = document.querySelector('#close-config');
const textAreaLinks = document.querySelector('#sheet-links');
const statBooks = document.querySelector('#stat-books');
const statTotal = document.querySelector('#stat-total');
const statAreas = document.querySelector('#stat-areas');
const chatMessages = document.querySelector('#chat-messages');
const aiInput = document.querySelector('#ai-input');

// --- MOTOR DE DATOS ---
async function loadData() {
  console.log('Iniciando carga de big data...');
  // Simulación de carga distribuida de libros
  let totalRows = 0;
  state.books.forEach(() => {
    totalRows += Math.floor(Math.random() * 5000) + 1000;
  });

  updateStats(totalRows);
  renderAreaTabs();
}

function renderAreaTabs() {
  let html = `<div class="area-item ${state.activeArea === 'global' ? 'active' : ''}" data-area="global">🌐 Consolidado Global</div>`;
  state.areas.forEach(area => {
    html += `<div class="area-item ${state.activeArea === area ? 'active' : ''}" data-area="${area}">📂 ${area}</div>`;
  });
  areaList.innerHTML = html;
}

function updateStats(total) {
  statBooks.textContent = state.books.length;
  statTotal.textContent = total.toLocaleString();
  statAreas.textContent = state.areas.size;
}

// --- ASISTENTE IA ---
function appendMessage(role, text) {
  const msg = document.createElement('div');
  msg.style.padding = '1rem';
  msg.style.borderRadius = '0.5rem';
  msg.style.fontSize = '0.9rem';
  msg.style.background = role === 'user' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)';
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleAISubmit() {
  const text = aiInput.value.trim();
  if (!text) return;

  appendMessage('user', text);
  aiInput.value = '';

  // Procesamiento simulado de Gemini
  setTimeout(() => {
    const response = `Basado en el análisis de los 5 libros vinculados, en el área de ${state.activeArea} se detecta un pico de actividad hoy. El total procesado hasta la fecha asciende a ${statTotal.textContent} registros consolidados.`;
    appendMessage('ai', response);
  }, 1000);
}

// --- CONFIG ---
function setupEventListeners() {
  btnConfig.addEventListener('click', () => modalConfig.style.display = 'flex');
  closeModal.addEventListener('click', () => modalConfig.style.display = 'none');

  // GUARDAR CONFIGURACIÓN DE LIBROS
  document.querySelector('#save-config').addEventListener('click', () => {
    const rawLinks = textAreaLinks.value.trim();
    if (!rawLinks) return alert('Por favor ingresa al menos un link');

    const newBooks = rawLinks.split('\n').map(link => {
      const match = link.match(/\/d\/(.*?)(\/|$)/);
      return match ? match[1] : link.trim();
    }).filter(id => id.length > 5);

    state.books = newBooks;
    localStorage.setItem('dashboard_books', JSON.stringify(newBooks));

    alert('¡Ecosistema actualizado! Se han cargado ' + newBooks.length + ' libros.');
    modalConfig.style.display = 'none';
    loadData();
  });

  areaList.addEventListener('click', (e) => {
    const item = e.target.closest('.area-item');
    if (!item) return;
    document.querySelectorAll('.area-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    state.activeArea = item.dataset.area;
    currentTitle.textContent = item.textContent;
  });

  aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAISubmit();
  });

  // APLICAR FILTROS
  document.querySelector('#btn-apply-filters').addEventListener('click', () => {
    const start = document.querySelector('#date-start').value;
    const end = document.querySelector('#date-end').value;
    const compare = document.querySelector('#compare-mode').value;

    console.log('Aplicando filtros:', { start, end, compare });

    if (compare !== 'none') {
      updateChartWithComparison(compare);
    } else {
      loadData(); // Recargar datos normales
    }
  });
}

function updateChartWithComparison(mode) {
  const dataset1 = [65, 59, 80, 81, 56, 120, 95];
  const dataset2 = [45, 48, 60, 70, 40, 80, 60];

  mainChart.data.datasets = [
    {
      label: mode === 'month' ? 'Mes Actual' : 'Q Actual',
      data: dataset1,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    },
    {
      label: mode === 'month' ? 'Mes Anterior' : 'Q Anterior',
      data: dataset2,
      borderColor: '#ec4899', // Rosa para comparativa
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      fill: true,
      tension: 0.4
    }
  ];
  mainChart.update();
  appendMessage('ai', `He generado la comparativa de ${mode === 'month' ? 'Mes vs Mes Anterior' : 'Trimestre vs Trimestre'}. Puedes ver la diferencia en el gráfico principal.`);
}

let mainChart; // Variable global para el gráfico

function init() {
  // Cargar libros guardados o usar los iniciales
  const savedBooks = localStorage.getItem('dashboard_books');
  if (savedBooks) {
    state.books = JSON.parse(savedBooks);
  }

  textAreaLinks.value = state.books.join('\n');
  setupEventListeners();
  loadData();

  // Inicializar Google Login
  window.onload = function () {
    google.accounts.id.initialize({
      client_id: "TU_CLIENT_ID.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
      document.getElementById("google-login-container"),
      { theme: "outline", size: "large" }
    );
  }
}

init();

// Gráfico Principal
const ctx = document.getElementById('mainChart');
mainChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Actividad Consolidada',
      data: [65, 59, 80, 81, 56, 120, 95],
      borderColor: '#6366f1',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(99, 102, 241, 0.1)'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  }
});
