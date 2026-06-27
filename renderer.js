const { ipcRenderer } = require('electron');

let profiles = [];
let activeIndex = -1;

// DOM elements
const tabBar = document.getElementById('tab-bar');
const addBtn = document.getElementById('add-profile');
const welcome = document.getElementById('welcome');
const dialogOverlay = document.getElementById('dialog-overlay');
const muteBtn = document.getElementById('mute-btn');
const compactBtn = document.getElementById('compact-btn');

// Add profile button
addBtn.addEventListener('click', () => {
  dialogOverlay.classList.add('show');
  document.getElementById('profile-name').focus();
});

// Close dialog on overlay click
dialogOverlay.addEventListener('click', (e) => {
  if (e.target === dialogOverlay) closeDialog();
});

// ESC to close dialog
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDialog();
});

// Enter to save in dialog
document.getElementById('profile-token').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveProfile();
});

function closeDialog() {
  dialogOverlay.classList.remove('show');
  document.getElementById('profile-name').value = '';
  document.getElementById('profile-token').value = '';
}

function saveProfile() {
  const name = document.getElementById('profile-name').value.trim() || 'Profile';
  const token = document.getElementById('profile-token').value.trim();
  ipcRenderer.send('add-profile', { name, token });
  closeDialog();
}

// Receive profiles on load
ipcRenderer.on('profiles-loaded', (event, loaded) => {
  profiles = loaded;
});

ipcRenderer.on('profile-added', (event, { id, name }) => {
  // Will be handled by tabs-updated
});

ipcRenderer.on('profiles-updated', (event, updated) => {
  profiles = updated;
});

// Tab bar updates
ipcRenderer.on('tabs-updated', (event, tabs) => {
  rebuildTabs(tabs);
});

ipcRenderer.on('active-profile-changed', (event, index) => {
  activeIndex = index;
  highlightTab(index);
});

function rebuildTabs(tabs) {
  // Remove existing tabs (keep add button, status bar)
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
      <span class="close" data-action="close">×</span>
    `;

    el.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'close') {
        ipcRenderer.send('remove-profile', tab.id);
      } else {
        ipcRenderer.send('switch-profile', i);
      }
    });

    // Middle-click to close
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
  const tabs = tabBar.querySelectorAll('.tab');
  if (tabs.length > 0) {
    const activeTab = tabBar.querySelector('.tab.active');
    if (activeTab) {
      ipcRenderer.send('mute-profile', activeTab.dataset.id);
      muteBtn.textContent = muteBtn.textContent === '🔊' ? '🔇' : '🔊';
    }
  }
});

// Compact toggle
compactBtn.addEventListener('click', () => {
  const menu = require('electron').remote?.Menu?.getApplicationMenu();
  if (menu) {
    const compactItem = menu.getMenuItemById('compact');
    if (compactItem) compactItem.click();
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
