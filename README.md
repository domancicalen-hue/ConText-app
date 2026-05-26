# ConText — Deploy Guide

## Struttura cartella
```
context-deploy/
├── api/
│   └── transform.js      ← proxy sicuro API Anthropic
├── public/
│   ├── manifest.json     ← PWA manifest
│   ├── sw.js             ← service worker
│   └── icons/            ← icone app (genera da context-pwa-kit.html)
├── src/
│   ├── main.jsx          ← entry point
│   └── App.jsx           ← app completa
├── index.html
├── package.json
└── vite.config.js
```

## Deploy su Vercel

1. Vai su vercel.com → New Project → Upload cartella
2. Carica questa intera cartella
3. Aggiungi la variabile d'ambiente lato server:
   - Nome: `ANTHROPIC_API_KEY`
   - Valore: inserisci la tua chiave Anthropic direttamente nel pannello del provider, senza salvarla nel codice o nel repository.
4. Clicca Deploy

## Note
- La API key non è mai nel codice frontend
- Il proxy /api/transform la usa lato server
- I crediti e la cronologia sono in localStorage
