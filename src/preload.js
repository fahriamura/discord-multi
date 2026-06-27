// ============================================
// Discord Multi — Preload Script
// Blocks WebRTC + disables heavy features
// ============================================

// ---- Block WebRTC completely (prevents voice/video) ----
const webrtcAPIs = [
  'RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection',
  'RTCSessionDescription', 'RTCIceCandidate', 'RTCDataChannel',
  'MediaStream', 'MediaStreamTrack', 'MediaDeviceInfo',
  'getUserMedia', 'webkitGetUserMedia',
  'AudioContext', 'webkitAudioContext',
];

webrtcAPIs.forEach((key) => {
  try { delete window[key]; } catch (e) {}
});

// Stub navigator.mediaDevices
try {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: () => Promise.reject(new Error('Voice/Video disabled')),
      enumerateDevices: () => Promise.resolve([]),
      getDisplayMedia: () => Promise.reject(new Error('Screen share disabled')),
    },
    writable: false,
    configurable: false,
  });
} catch (e) {}

// Stub speech synthesis
try {
  Object.defineProperty(window, 'speechSynthesis', {
    value: { speak: () => {}, cancel: () => {}, pause: () => {}, resume: () => {} },
    writable: false,
  });
} catch (e) {}

// Block speech recognition
try { delete window.SpeechRecognition; } catch (e) {}
try { delete window.webkitSpeechRecognition; } catch (e) {}

// ---- Lightweight CSS (no aggressive hiding) ----
const style = document.createElement('style');
style.id = 'discord-multi-light';
style.textContent = `
  /* Disable font smoothing for lighter rendering */
  body {
    font-smooth: never !important;
    -webkit-font-smoothing: none !important;
    text-rendering: optimizeSpeed !important;
  }
`;
if (document.head) {
  document.head.appendChild(style);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.head) document.head.appendChild(style);
  });
}
