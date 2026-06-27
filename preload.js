const { contextBridge, ipcRenderer } = require('electron');

// Strip WebRTC completely
delete window.RTCPeerConnection;
delete window.webkitRTCPeerConnection;
delete window.mozRTCPeerConnection;
delete window.RTCSessionDescription;
delete window.RTCIceCandidate;
delete window.RTCDataChannel;
delete window.MediaStream;
delete window.MediaStreamTrack;
delete window.getUserMedia;
delete window.navigator.mediaDevices;
delete window.AudioContext;
delete window.webkitAudioContext;
delete window.SpeechRecognition;
delete window.webkitSpeechRecognition;
delete window.SpeechSynthesisUtterance;
delete window.speechSynthesis;

// Make navigator.mediaDevices return empty
if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error('Voice/Video disabled'));
  navigator.mediaDevices.enumerateDevices = () => Promise.resolve([]);
}

// Expose token injector
contextBridge.exposeInMainWorld('tokenInject', (token) => {
  try {
    document.body.dispatchEvent(new CustomEvent('discord-multi-token', { detail: token }));
  } catch (e) {}
});

// CSS injection to hide voice/video/stream UI elements
const style = document.createElement('style');
style.textContent = `
  /* Hide voice/video call buttons */
  [class*="voice_"], [class*="Voice"],
  [class*="video_"], [class*="Video"],
  [class*="call_"], [class*="Call"],
  [class*="stream_"], [class*="Stream"],
  [class*="screenShare"], [class*="screen-share"],
  
  /* Hide voice channel join buttons */
  [class*="voiceChannel"],
  [class*="voice-channel"],
  [aria-label*="Voice"], [aria-label*="voice"],
  [aria-label*="Video"], [aria-label*="video"],
  [aria-label*="Call"], [aria-label*="call"],
  [aria-label*="Stream"], [aria-label*="stream"],
  
  /* Hide voice status indicators */
  [class*="speaking_"], [class*="Speaking"],
  [class*="micTest"], [class*="mic-test"],
  [class*="noiseCancellation"],
  [class*="noise-cancellation"],
  [class*="echoCancellation"],
  
  /* Hide game activity / overlay */
  [class*="game_"], [class*="Game"],
  [class*="activity_"], [class*="Activity"],
  [class*="overlay_"], [class*="Overlay"],
  [class*="streaming_"], [class*="Streaming"],
  [class*="nowPlaying"], [class*="now-playing"],
  
  /* Hide Nitro / shop promotions */
  [class*="premium_"], [class*="Premium"],
  [class*="nitro_"], [class*="Nitro"],
  [class*="shop_"], [class*="Shop"],
  [class*="store_"], [class*="Store"],
  [class*="upsell_"], [class*="Upsell"],
  
  /* Disable animations for performance */
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
  }
  
  /* Lightweight fonts */
  body {
    font-smooth: never;
    -webkit-font-smoothing: none;
  }
`;
document.addEventListener('DOMContentLoaded', () => {
  document.head.appendChild(style);
});
// Also inject now in case DOM is already loaded
if (document.head) {
  document.head.appendChild(style);
}
