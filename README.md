# Discord Multi

**Lightweight multi-profile Discord client** — jalankan banyak akun Discord dalam satu aplikasi tanpa beban berat.

## ✨ Fitur
- **Multi Profile** — tambah & switch antar akun Discord dalam satu window
- **Ringan** — voice/video chat, streaming, game overlay, dan Nitro promotions dihapus total
- **Isolated Sessions** — setiap profile punya session terpisah (cookies, localStorage sendiri)
- **UI Minimal** — tab bar sederhana, no distractions
- **Animasi dimatikan** — UI lebih ringan & responsif

## 🔧 Yang Dihapus (biar ringan)
- ❌ Voice chat & voice channel
- ❌ Video call & screen share  
- ❌ Streaming & Go Live
- ❌ Game activity & overlay
- ❌ Nitro / Shop promotions
- ❌ WebRTC (RTCPeerConnection diblok di preload)
- ❌ Animasi CSS (semua transition/animation diset 0s)

## 🚀 Run
```
npm install
npm start
```

## 📦 Build
```
npm run build
```
Output di folder `dist/`.

## 🔑 Token Login (opsional)
Bisa login manual via Discord web page, atau pakai token:
1. Buka Discord di browser
2. `F12` → Application → Local Storage → `token`
3. Paste di dialog "Add Profile"

## ⚙️ Tech
- **Electron** — cross-platform desktop
- **BrowserView** — isolated session per profile
- **electron-store** — local encrypted profile storage
