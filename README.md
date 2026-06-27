# Discord Multi

**Lightweight multi-profile Discord client** — jalankan banyak akun Discord dalam satu aplikasi tanpa beban berat.

## ✨ Fitur
- **Multi Profile** — tambah & switch antar akun Discord dalam satu window
- **Login Email & Password** — native Discord login, bukan token
- **Ringan** — voice/video chat, streaming, game overlay, dan Nitro promotions dihapus total
- **Session Terisolasi** — setiap profile punya session terpisah (cookies, localStorage sendiri)
- **UI Minimal** — tab bar sederhana, no distractions
- **Animasi dimatikan** — UI lebih ringan & responsif

## 🔧 Yang Dihapus (biar ringan)
- ❌ Voice chat & voice channel
- ❌ Video call & screen share  
- ❌ Streaming & Go Live
- ❌ Game activity & overlay
- ❌ Nitro / Shop promotions
- ❌ WebRTC (RTCPeerConnection diblok di preload)
- ❌ Animasi CSS
- ❌ Telemetri & analytics

## 📁 Struktur
```
discord-multi/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Strip voice/video + CSS injection
│   ├── renderer.js      # Tab UI logic + IPC
│   └── index.html       # UI markup
├── assets/
│   └── icon.png
├── .github/workflows/   # CI/CD multi-platform build
├── package.json
└── README.md
```

## 🚀 Run
```
npm install
npm start
```

## 📦 Build
| Perintah | Output |
|---|---|
| `npm run build` | Windows `.exe` (NSIS installer) |
| `npm run build:linux` | Linux `.AppImage` + `.deb` |
| `npm run build:mac` | macOS `.dmg` |
| `npm run build:all` | Semua platform |

## 🔑 Login
1. Klik **+** di tab bar
2. Masukkan nama profile
3. Halaman login Discord terbuka → masuk pakai **email & password** seperti biasa
4. Session otomatis tersimpan & terisolasi dari profile lain

## ⚙️ Tech
- **Electron** — cross-platform desktop
- **BrowserView** — isolated session per profile
- **Native fs JSON** — zero-dependency profile storage
