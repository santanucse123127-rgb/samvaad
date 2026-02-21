# Clipboard Sync Feature — Documentation

## Overview

Samvaad now includes **real-time cross-device clipboard synchronization**. A user can copy text, links, or small files on one device (desktop/laptop) and instantly access them on any other device where they are logged in to Samvaad.

---

## Architecture

```
Device A (browser)                    Server (Node.js + Socket.IO)           Device B (browser)
──────────────────                    ────────────────────────────           ─────────────────
User copies text
  │
  ▼
ClipboardContext.pushClipboard()
  │                                         
  ├─► POST /api/clipboard ────────────► clipboardController.pushClipboardItem()
  │                                           │
  │                                           ├─► AES-256-GCM encrypt content
  │                                           ├─► Save to MongoDB (TTL: 24h)
  │                                           └─► io.to(userId).emit('clipboard:new-item')
  │                                                         │
  └─► socketService.emit('clipboard:push') ──── socket broadcasts to same user's rooms
                                                            │
                                                            ▼
                                                  ClipboardContext listener
                                                  addToHistory() + toast alert
                                                  "📋 Clipboard Synced" banner
```

---

## Security

| Layer | Implementation |
|-------|---------------|
| **Transport** | Runs over TLS/wss in production |
| **Data at rest** | AES-256-GCM encryption (via `crypto` built-in) before MongoDB write |
| **Auto-expiry** | MongoDB TTL index deletes items after **24 hours** automatically |
| **Auth** | All REST endpoints protected by JWT `protect` middleware |
| **Socket auth** | Socket.IO middleware validates JWT on connection |
| **User isolation** | Items scoped to `userId` — users can never see each other's clippings |

---

## Files Created / Modified

### Backend

| File | Purpose |
|------|---------|
| `backend/models/ClipboardItem.js` | Mongoose model with TTL index (24h auto-delete) |
| `backend/controllers/clipboardController.js` | Push, list, delete, clear — with AES-256 encrypt/decrypt |
| `backend/routes/clipboardRoutes.js` | REST routes (`/api/clipboard`) |
| `backend/socket/socketHandler.js` | Added `clipboard:push` socket event handler |
| `backend/server.js` | Registered `/api/clipboard` route |
| `backend/.env` | Added `CLIPBOARD_SECRET` for AES-256 key |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/context/ClipboardContext.jsx` | All clipboard state, socket listeners, push/history/copy/delete |
| `frontend/src/services/clipboardAPI.js` | Axios wrapper for clipboard REST endpoints |
| `frontend/src/components/Chat/ClipboardSync.jsx` | Full-featured panel UI |
| `frontend/src/pages/Chat.jsx` | Integrated clipboard button + panel |
| `frontend/src/App.jsx` | Wrapped chat route with `<ClipboardProvider>` |

---

## API Endpoints

### `POST /api/clipboard`
Push a new clipboard item.

**Body:**
```json
{
  "type": "text | url | image | file | rich-text",
  "content": "The copied text or URL",
  "fileData": "base64-encoded data (for files/images)",
  "fileName": "optional filename",
  "fileSize": 12345,
  "mimeType": "image/png",
  "sourceDevice": { "name": "Windows Browser", "platform": "Windows" }
}
```

**Response:** The persisted item with decrypted content (only returned once).

---

### `GET /api/clipboard`
Returns the last 50 clipboard items (decrypted), newest first.

---

### `DELETE /api/clipboard/:id`
Delete a single item.

---

### `DELETE /api/clipboard`
Clear all items for the authenticated user.

---

## Socket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `clipboard:push` | Client → Server | clipboard item | Server broadcasts to all other sessions |
| `clipboard:new-item` | Server → Client | clipboard item | New item available from another device |
| `clipboard:item-deleted` | Server → Client | `{ id }` | Item was deleted |
| `clipboard:cleared` | Server → Client | — | All items were cleared |

---

## UI Features

### Clipboard Panel (ClipboardSync.jsx)
- Accessible via the **📋 clipboard icon** in the sidebar header
- Slides in from the right as a 300px panel
- Shows a **real-time alert banner** when a new item arrives from another device
- **"Sync current clipboard"** button — reads browser clipboard and pushes it
- **Manual text input** — type/paste and push in one click
- **File drag & drop zone** — drop images, PDFs, docs (max 1 MB)
- **History list** with search, type badges, source device info, timestamp
- **One-tap copy** from history to local clipboard
- **Per-item delete** and **clear all** actions
- **Sync toggle** — disable clipboard sync on this device
- AES-256 + 24h auto-delete notice in footer

---

## Configuration

### Backend `.env`
```env
# 32-character AES-256 encryption key for clipboard data
CLIPBOARD_SECRET=samvaad_clipboard_key_AES256_32b!
```

> **Important:** In production, replace this with a securely generated random 32-byte key.

---

## Extending to Native Platforms

### Android (Kotlin)
```kotlin
// Read clipboard on change
val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
clipboard.addPrimaryClipChangedListener {
    val text = clipboard.primaryClip?.getItemAt(0)?.text?.toString() ?: return@addPrimaryClipChangedListener
    // POST to /api/clipboard with Bearer token
    api.pushClipboard(ClipboardPayload(type = "text", content = text, sourceDevice = DeviceInfo("Android", "Android")))
}
```

### iOS (Swift)
```swift
// Monitor pasteboard changes
Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
    if UIPasteboard.general.hasStrings {
        let text = UIPasteboard.general.string ?? ""
        // POST to /api/clipboard
    }
}
```

### Electron (Desktop)
```javascript
const { clipboard } = require('electron');
let lastContent = '';
setInterval(() => {
    const text = clipboard.readText();
    if (text !== lastContent) {
        lastContent = text;
        fetch('/api/clipboard', { method: 'POST', body: JSON.stringify({ type: 'text', content: text }) });
    }
}, 500);
```

---

## Security Considerations for Production

1. **Rotate `CLIPBOARD_SECRET`** regularly and keep it out of version control
2. **Enable HTTPS/WSS** — clipboard data is sensitive and must be encrypted in transit
3. **Rate-limit** `/api/clipboard` to prevent abuse (suggested: 30 req/min per user)
4. **Reduce TTL** if you want data to be more ephemeral (change `expiresAt` in the model)
5. **File size limit** is enforced at 1 MB in the UI — add server-side validation too
