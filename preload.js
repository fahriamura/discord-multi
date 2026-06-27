// ============================================
// Discord Multi — Preload Script
// Strips voice/video/streaming, keeps chat only
// ============================================

// ---- Block WebRTC completely ----
const blocked = [
  'RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection',
  'RTCSessionDescription', 'RTCIceCandidate', 'RTCDataChannel',
  'MediaStream', 'MediaStreamTrack', 'MediaDeviceInfo',
  'getUserMedia', 'webkitGetUserMedia',
  'AudioContext', 'webkitAudioContext',
  'SpeechRecognition', 'webkitSpeechRecognition',
  'SpeechSynthesisUtterance',
];

blocked.forEach((key) => {
  try { delete window[key]; } catch (e) {}
});

// Stub navigator.mediaDevices
try {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: () => Promise.reject(new Error('Voice/Video disabled by Discord Multi')),
      enumerateDevices: () => Promise.resolve([]),
      getDisplayMedia: () => Promise.reject(new Error('Screen share disabled')),
    },
    writable: false,
    configurable: false,
  });
} catch (e) {}

// Stub speechSynthesis
try {
  Object.defineProperty(window, 'speechSynthesis', {
    value: { speak: () => {}, cancel: () => {}, pause: () => {}, resume: () => {} },
    writable: false,
  });
} catch (e) {}

// ---- CSS injection: hide voice/video/stream UI ----
const HIDE_SELECTORS = [
  /* Voice/video call buttons */
  '[class*="voice_"]', '[class*="Voice"]',
  '[class*="video_"]', '[class*="Video"]',
  '[class*="call_"]', '[class*="Call"]',
  '[class*="stream_"]', '[class*="Stream"]',
  '[class*="screenShare"]', '[class*="screen-share"]',
  '[class*="camera_"]', '[class*="Camera"]',
  '[class*="microphone"]', '[class*="Microphone"]',
  '[class*="deafen"]', '[class*="undeafen"]',

  /* Voice channel join buttons */
  '[class*="voiceChannel"]', '[class*="voice-channel"]',
  '[data-list-item-id*="voice"]',

  /* Voice status indicators */
  '[class*="speaking_"]', '[class*="Speaking"]',
  '[class*="micTest"]', '[class*="mic-test"]',
  '[class*="noiseCancellation"]', '[class*="noise-cancellation"]',
  '[class*="echoCancellation"]',

  /* Game activity / overlay */
  '[class*="game_"]', '[class*="Game"]',
  '[class*="activity_"]', '[class*="Activity"]',
  '[class*="overlay_"]', '[class*="Overlay"]',
  '[class*="streaming_"]', '[class*="Streaming"]',
  '[class*="nowPlaying"]', '[class*="now-playing"]',

  /* Nitro / shop promotions */
  '[class*="premium_"]', '[class*="Premium"]',
  '[class*="nitro_"]', '[class*="Nitro"]',
  '[class*="shop_"]', '[class*="Shop"]',
  '[class*="store_"]', '[class*="Store"]',
  '[class*="upsell_"]', '[class*="Upsell"]',
];

// ---- Animation killer ----
const ANIMATION_KILLER = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
  }
`;

function injectCSS() {
  if (!document.head) return;

  const style = document.createElement('style');
  style.id = 'discord-multi-strip';
  style.textContent = `
    ${HIDE_SELECTORS.join(',\n    ')} {
      display: none !important;
    }
    ${ANIMATION_KILLER}
    /* Lightweight text rendering */
    body {
      font-smooth: never !important;
      -webkit-font-smoothing: none !important;
      text-rendering: optimizeSpeed !important;
    }
  `;
  document.head.appendChild(style);
}

// Inject CSS on DOM ready or immediately
if (document.head) {
  injectCSS();
} else {
  document.addEventListener('DOMContentLoaded', injectCSS);
}

// Re-inject on SPA navigation (Discord uses React Router)
let cssInjected = false;
new MutationObserver(() => {
  if (!cssInjected && document.head) {
    injectCSS();
    cssInjected = true;
  }
}).observe(document.documentElement, { childList: true, subtree: true });
