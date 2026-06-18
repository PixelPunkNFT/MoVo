# Movo - App Passaggi & Prevendite per Locali Latini Roma

**Piattaforma web per condividere passaggi e rivendere biglietti per la community latina di Roma**

---

## Stack Tecnologico

### Backend
- **Node.js + Express** — API REST
- **MongoDB Atlas** — Database cloud
- **Mongoose** — ORM con validazioni
- **JWT** — Autenticazione sicura
- **Socket.io** — Chat realtime
- **Bcrypt** — Password hashing
- **Cloudinary** — Upload immagini
- **Rate Limiting** — Protezione API
- **Nodemailer** — Email OTP / reset password

### Frontend Web
- **React 19 + Vite** — SPA moderna
- **React Router v6** — Routing
- **Axios** — HTTP client
- **Context API** — State management
- **Vite PWA Plugin** — Installabile come app

---

## Funzionalità Implementate

### Backend (Tutte Funzionanti)

1. **Autenticazione**
   - Registrazione con validazione
   - Login con JWT
   - Logout
   - Profilo utente (get/update)
   - Upload foto profilo
   - Reset password via email
   - Verifica OTP via email
   - Password hashing bcrypt

2. **Sistema Veicoli**
   - Aggiungi/modifica/elimina veicolo
   - Validazione formato targa italiana (AB123CD)
   - Obbligatorio per creare passaggi
   - Foto veicolo

3. **Passaggi (Rides)**
   - Passaggi spontanei (senza veicolo)
   - Passaggi con veicolo
   - Ricerca con filtri (città, destinazione, data, posti, prezzo, musica)
   - Dettagli passaggio con mappa
   - I miei passaggi (driver/passeggero)
   - Campi ricorrenza (`isRecurring`, `recurringDays`) pronti

4. **Prenotazioni (Bookings)**
   - Prenota passaggio
   - Conferma/rifiuta (driver)
   - Cancella prenotazione
   - Completa viaggio
   - Storico prenotazioni

5. **Prevendite Biglietti (Resales)**
   - Crea annuncio con foto (Cloudinary)
   - Modifica/elimina annuncio
   - Filtri: categoria, città, prezzo, data
   - Prendi in carico (claim)
   - Contatta venditore (whatsapp)
   - Segnala come venduto
   - Limite antispam (5/giorno)
   - Verifica telefono obbligatoria

6. **Chat Realtime (Socket.io)**
   - Messaggi istantanei
   - Notifiche in-app
   - Segna come letto
   - Badge conteggi non letti

7. **Sistema Recensioni**
   - Recensioni 1-5 stelle
   - Tag e commenti
   - Rating medio utente
   - Visibilità gestita da admin

8. **Admin Panel**
   - Dashboard statistiche
   - Gestione utenti (sospendi/verifica)
   - Gestione recensioni
   - Cancella passaggi
   - Promuovi admin

9. **Sicurezza**
   - Rate limiting (100 req/15min)
   - Helmet security headers
   - Sanitizzazione input MongoDB
   - Validazioni Mongoose complete
   - CORS configurato
   - JWT middleware

### Frontend Web (Tutte Funzionanti)

1. **Landing Page**
   - Hero animato
   - Pipeline interattiva
   - Registrazione/Login

2. **Autenticazione**
   - Login/Register
   - Reset password
   - Verifica OTP
   - Protezione route

3. **Home**
   - Saluto personalizzato
   - Quick actions (Cerca/Esco stasera)
   - Locali popolari
   - Switcher Passaggi/Prevendite

4. **Passaggi**
   - Cerca con filtri (città, data, prezzo, musica)
   - Crea passaggio spontaneo
   - Dettaglio con mappa
   - Prenota/contatta
   - Condividi su WhatsApp/Telegram

5. **Prevendite**
   - Crea annuncio con foto
   - Modifica annuncio
   - Ricerca con filtri
   - Dettaglio (claim, contatta, segnala)
   - Le mie prevendite

6. **Profilo**
   - Foto profilo con upload
   - Statistiche (recensioni, passaggi)
   - Modifica dati
   - Preferenze (allerta, locali preferiti)
   - Badge verifica
   - Geoposizione

7. **Altro**
   - Notifiche in-app
   - Chat con badge conteggi
   - Privacy Policy
   - PWA installabile
   - Cookie consent
   - Splash screen animata

---

## Ultimi Upgrade

- **Rebranding:** GoEvent → **Movo**
- **Logo:** Immagine `Movo.png` usata in tutto il sito
- **Spinner caricamento:** Logo Movo animato (rotazione 360°)
- **Icone PWA/Favicon:** Aggiornate con "Mo" su gradiente oro
- **Splash screen:** Solo logo Movo rotante
- **Modifica prevendite:** Nuova pagina edit con upload foto
- **Pickup predefiniti:** Sistema venue/punti di ritrovo

---

## Struttura Progetto

```
app caraibe/
├── backend/
│   ├── models/              # 15+ Mongoose Models
│   ├── controllers/         # Business Logic
│   ├── routes/              # API Routes
│   ├── middleware/           # Auth, Upload, Validation
│   ├── sockets/              # Socket.io Handler
│   ├── config/               # Cloudinary config
│   ├── utils/                # Logger, helpers
│   ├── server.js             # Entry Point
│   └── .env
│
├── web_app/
│   ├── src/
│   │   ├── components/      # Componenti riutilizzabili
│   │   ├── pages/            # Pagine (auth, ride, resale, profile, admin...)
│   │   ├── services/         # API services (Axios)
│   │   ├── contexts/         # React Contexts (Auth, Ride, Booking, Chat)
│   │   ├── hooks/           # Custom hooks
│   │   ├── config/          # Tema, colori
│   │   └── utils/           # Share utilities
│   ├── public/              # Static assets
│   ├── index.html
│   └── vite.config.js
│
├── README_COMPLETO.md       # Questo file
└── backend/uploads/         # Upload temporanei
```

---

## Come Avviare

### Backend
```bash
cd backend
npm install
npm run dev
```
Server su `http://localhost:5000`

### Frontend Web
```bash
cd web_app
npm install
npm run dev
```
App su `http://localhost:5173`

---

## API Endpoints Principali

### Auth
- `POST /api/auth/register` — Registrazione
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Profilo corrente
- `PUT /api/auth/profile` — Aggiorna profilo
- `POST /api/auth/upload-photo` — Upload foto

### Passaggi (Rides)
- `POST /api/rides` — Crea passaggio
- `POST /api/rides/spontaneous` — Passaggio spontaneo
- `GET /api/rides/search` — Cerca con filtri
- `GET /api/rides/:id` — Dettagli

### Prevendite (Resales)
- `POST /api/resales` — Crea annuncio
- `PUT /api/resales/:id` — Modifica annuncio
- `GET /api/resales` — Lista con filtri
- `GET /api/resales/my` — I miei annunci

### Prenotazioni (Bookings)
- `POST /api/bookings/:rideId` — Prenota
- `PUT /api/bookings/:id/confirm` — Conferma

---

## Design System

### Colori
- **Primary / Oro:** `#D4AF37`
- **Background:** `#0F1115`
- **Surface:** `#16181D`
- **Card:** `#1A1D24`
- **Text:** `#FFFFFF`
- **Text Secondary:** `#B8BCC8`

### Font
- **Family:** Inter, SF Pro Display
- **Titoli:** 800 weight
- **Body:** 400-500 weight

---

## TODO Futuro

- [x] Rebranding Movo completo
- [x] Modifica prevendite
- [x] Spinner logo animato
- [ ] Abbonamenti / Pass settimanali
- [ ] Punti di ritrovo predefiniti (PickupPoint)
- [ ] Google Maps integration
- [ ] Pagamenti (Stripe)
- [ ] Notifiche push (Firebase)
- [ ] Tests (Jest/Cypress)
