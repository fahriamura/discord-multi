const { ipcRenderer } = require('electron');

let profiles = [];
let activeIndex = -1;

// DOM elements
const tabBar = document.getElementById('tab-bar');
const addBtn = document.getElementById('add-profile');
const welcome = document.getElementById('welcome');
const dialogOverlay = document.getElementById('dialog-overlay');
const muteBtn = document.getElementById('mute-btn');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');
const profileNameInput = document.getElementById('profile-name');

// ── Dialog controls ──

function openDialog() {
  dialogOverlay.classList.add('show');
  profileNameInput.value = '';
  profileNameInput.focus();
}

function closeDialog() {
  dialogOverlay.classList.remove('show');
}

function saveProfile() {
  const name = profileNameInput.value.trim() || 'Discord';
  ipcRenderer.send('add-profile', { name });
  closeDialog();
}

// Add profile button
addBtn.addEventListener('click', openDialog);

// Dialog buttons
btnCancel.addEventListener('click', closeDialog);
btnSave.addEventListener('click', saveProfile);

// Close dialog on overlay click (not on dialog itself)
dialogOverlay.addEventListener('click', (e) => {
  if (e.target === dialogOverlay) closeDialog();
});

// ESC to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dialogOverlay.classList.contains('show')) {
    closeDialog();
  }
});

// Enter in name input
profileNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveProfile();
});

// ── IPC listeners ──

ipcRenderer.on('profiles-loaded', (event, loaded) => {
  profiles = loaded;
});

ipcRenderer.on('profiles-updated', (event, updated) => {
  profiles = updated;
});

ipcRenderer.on('tabs-updated', (event, tabs) => {
  rebuildTabs(tabs);
});

ipcRenderer.on('active-profile-changed', (event, index) => {
  activeIndex = index;
  highlightTab(index);
});

ipcRenderer.on('profile-added', (event, { id, name }) => {
  // tab will be built by tabs-updated
});

// ── Tab bar ──

function rebuildTabs(tabs) {
  const existing = tabBar.querySelectorAll('.tab');
  existing.forEach((t) => t.remove());

  tabs.forEach((tab, i) => {
    const el = document.createElement('div');
    el.className = 'tab' + (i === activeIndex ? ' active' : '');
    el.dataset.index = i;
    el.dataset.id = tab.id;
    el.innerHTML = `
      <span class="dot"></span>
      <span class="name">${escapeHtml(tab.name)}</span>
      <span class="close" title="Remove" data-action="close">×</span>
    `;

    el.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'close') {
        e.stopPropagation();
        ipcRenderer.send('remove-profile', tab.id);
      } else {
        ipcRenderer.send('switch-profile', i);
      }
    });

    el.addEventListener('auxclick', (e) => {
      if (e.button === 1) {
        ipcRenderer.send('remove-profile', tab.id);
      }
    });

    tabBar.insertBefore(el, addBtn);
  });

  updateWelcome();
}

function highlightTab(index) {
  const tabs = tabBar.querySelectorAll('.tab');
  tabs.forEach((t, i) => {
    t.classList.toggle('active', i === index);
  });
}

function updateWelcome() {
  const tabs = tabBar.querySelectorAll('.tab');
  welcome.classList.toggle('hidden', tabs.length > 0);
}

// Mute toggle
muteBtn.addEventListener('click', () => {
  const activeTab = tabBar.querySelector('.tab.active');
  if (activeTab) {
    ipcRenderer.send('mute-profile', activeTab.dataset.id);
    muteBtn.textContent = muteBtn.textContent === '🔊' ? '🔇' : '🔊';
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
