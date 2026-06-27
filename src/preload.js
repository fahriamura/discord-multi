// ============================================
// Discord Multi — Preload Script
// Blocks WebRTC for voice/video, keeps everything else intact
// ============================================

// ---- Block WebRTC (prevents voice/video calls) ----
// Only block actual WebRTC APIs. Keep AudioContext (needed for captcha, sound effects).
const webrtcAPIs = [
  'RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection',
  'RTCSessionDescription', 'RTCIceCandidate', 'RTCDataChannel',
];

webrtcAPIs.forEach((key) => {
  try { delete window[key]; } catch (e) {}
});

// Block getUserMedia only (camera/mic access)
try {
  const orig = navigator.mediaDevices;
  if (orig) {
    orig.getUserMedia = () => Promise.reject(new Error('Voice/Video disabled'));
    orig.getDisplayMedia = () => Promise.reject(new Error('Screen share disabled'));
  }
} catch (e) {}

// ---- Lightweight CSS (minimal, won't break anything) ----
const style = document.createElement('style');
style.id = 'discord-multi-light';
style.textContent = `
  body {
    font-smooth: never !important;
    -webkit-font-smoothing: none !important;
  }
`;
if (document.head) {
  document.head.appendChild(style);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.head) document.head.appendChild(style);
  });
}
