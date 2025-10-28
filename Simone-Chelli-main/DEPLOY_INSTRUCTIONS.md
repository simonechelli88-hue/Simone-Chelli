# 🚀 ISTRUZIONI DEPLOYMENT GRATUITO - RAPPORTINI EURO EL

## ✅ GRATIS per sempre su Render.com!

Questa guida ti permetterà di pubblicare **RAPPORTINI EURO EL** online **gratuitamente** su Render.com.

---

## 📋 PREREQUISITI

Prima di iniziare, avrai bisogno di:
1. Un account **GitHub** (gratuito) - [Registrati qui](https://github.com/signup)
2. Un account **Render** (gratuito) - [Registrati qui](https://render.com/register)

---

## 🎯 PASSO 1: Carica il Codice su GitHub

### 1.1 Scarica il Progetto da Replit

1. Clicca su **"Download as zip"** dal menu di Replit
2. Estrai lo ZIP sul tuo computer
3. Apri la cartella estratta

### 1.2 Carica su GitHub

**Opzione A - Tramite Interfaccia GitHub (Più Semplice):**

1. Vai su [GitHub](https://github.com)
2. Fai login
3. Clicca sul pulsante **"+"** in alto a destra → **"New repository"**
4. Nome repository: `rapportini-euro-el`
5. Lascia **Public** (o scegli Private se preferisci)
6. **NON** selezionare "Add a README"
7. Clicca **"Create repository"**
8. Clicca su **"uploading an existing file"**
9. Trascina TUTTI i file e cartelle del progetto
10. Clicca **"Commit changes"**

**Opzione B - Tramite Git (Se Sai Usare il Terminale):**

```bash
cd /percorso/alla/cartella/rapportini-euro-el
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/rapportini-euro-el.git
git push -u origin main
```

---

## 🚀 PASSO 2: Pubblica su Render

### 2.1 Crea Account Render

1. Vai su [render.com/register](https://render.com/register)
2. Registrati usando il tuo account GitHub (più semplice!)

### 2.2 Collega GitHub a Render

1. Dalla dashboard di Render, clicca **"New +"** → **"Blueprint"**
2. Autorizza Render ad accedere ai tuoi repository GitHub
3. Cerca e seleziona il repository `rapportini-euro-el`
4. Clicca **"Connect"**

### 2.3 Configura il Deployment

Render leggerà automaticamente il file `render.yaml` e creerà:
- ✅ Un **Web Service** per l'applicazione
- ✅ Un **Database PostgreSQL** gratuito

1. Render ti mostrerà un'anteprima dei servizi che verranno creati
2. Clicca **"Apply"**
3. Aspetta 5-10 minuti mentre Render:
   - Installa le dipendenze
   - Crea il database
   - Compila e lancia l'applicazione

---

## 🎉 PASSO 3: Inizializza il Database

Una volta completato il deployment:

### 3.1 Accedi al Database

1. Dalla dashboard Render, vai su **"rapportini-db"** (il database)
2. Nella sezione **"Info"**, trovi **"PSQL Command"**
3. Copia il comando (simile a: `PGPASSWORD=xxx psql -h xxx.oregon-postgres.render.com...`)

### 3.2 Esegui le Migrazioni

**Opzione A - Dalla Console Render:**

1. Vai sul tuo **Web Service** (`rapportini-euro-el`)
2. Clicca su **"Shell"** nel menu laterale
3. Esegui:
   ```bash
   npm run db:push
   ```

**Opzione B - Dal Tuo Computer:**

1. Copia l'URL del database dalla sezione "Connection String" (Internal Database URL)
2. Sul tuo computer, nella cartella del progetto:
   ```bash
   export DATABASE_URL="postgres://user:password@host/database"
   npm run db:push
   ```

### 3.3 Popola i Dati Iniziali

Sempre dalla Shell di Render o dal tuo computer:

```bash
node -e "require('./server/seedEmployees.js')"
```

Questo creerà:
- ✅ 19 dipendenti
- ✅ 1 account admin
- ✅ 79+ fasi di lavoro

---

## 🌐 PASSO 4: Accedi all'App Online!

1. Dalla dashboard Render, vai sul tuo **Web Service**
2. In alto troverai l'URL pubblico (es: `https://rapportini-euro-el.onrender.com`)
3. Clicca sull'URL → **L'APP È ONLINE!** 🎉

### Login:

**Dipendenti:**
- Codice: Nome e cognome (es: `simone chelli`, `dario motroni`, etc.)

**Amministratore:**
- Codice: `admin`

---

## 🔄 AGGIORNARE L'APP (Modifiche Future)

Ogni volta che fai modifiche:

1. **Aggiorna il codice su GitHub:**
   - Carica i nuovi file su GitHub (come fatto nel Passo 1)
   
2. **Render rileva automaticamente le modifiche:**
   - Render farà un nuovo deploy automaticamente!
   - Aspetta 5-10 minuti per il completamento

---

## 💡 SUGGERIMENTI

### Mantenere l'App Sempre Attiva

Il piano gratuito di Render mette l'app in "sleep" dopo 15 minuti di inattività.
Per evitarlo, puoi usare un servizio gratuito come [UptimeRobot](https://uptimerobot.com):

1. Registrati su UptimeRobot (gratis)
2. Aggiungi un monitor HTTP per il tuo URL Render
3. Imposta controllo ogni 5 minuti
4. L'app resterà sempre attiva! ✅

### Limiti Piano Gratuito Render

- ✅ 750 ore/mese di runtime (= sempre attivo!)
- ✅ Database PostgreSQL 90 giorni di retention
- ✅ 100 GB bandwidth/mese
- ✅ HTTPS gratuito

**Per un'app come RAPPORTINI EURO EL con ~20 utenti, è più che sufficiente!**

---

## 🆘 PROBLEMI COMUNI

### "Build failed"
- Verifica che TUTTI i file siano stati caricati su GitHub
- Controlla i log nella sezione "Logs" del Web Service

### "Database connection error"
- Assicurati di aver eseguito `npm run db:push`
- Verifica che il DATABASE_URL sia configurato correttamente

### "App non si carica"
- Aspetta 1-2 minuti dopo il primo deploy
- Controlla i logs per errori

---

## 📞 SUPPORTO

Per problemi o domande:
- Documentazione Render: https://render.com/docs
- Community Render: https://community.render.com

---

## 🎉 CONGRATULAZIONI!

Hai pubblicato **RAPPORTINI EURO EL** online **GRATIS**! 🚀

L'app è ora accessibile 24/7 da qualsiasi dipendente EURO EL!
