# Report QA redesign mobile ConText — 15 giugno 2026

## Sintesi

Il redesign mobile è stato implementato nel componente principale `src/App.jsx` con approccio **mobile-first**. La logica funzionale esistente è stata preservata: stati React, funzioni di selezione situazione, inserimento messaggio, scelta tono, trasformazione, paywall, crediti, cronologia e modali non sono stati riscritti nella loro logica applicativa; sono stati riorganizzati markup e CSS per migliorare gerarchia visiva, leggibilità e spazio su smartphone.

## Interventi principali

| Area | Prima | Dopo |
|---|---|---|
| Header mobile | Link e credito molto compressi su una riga | Header disposto in griglia mobile, elementi più grandi e separati |
| Stepper | Numeri e testi piccoli con rischio taglio | Stepper in card 2x2 su mobile, più leggibile e senza overflow |
| Hero | Molte informazioni compatte nella stessa schermata | Hero più editoriale, CTA primaria evidente e CTA secondaria separata |
| Sezioni importanti | Esempio, privacy, lavoro e premium ravvicinati | Card con maggiore spaziatura, gerarchia e separazione visiva |
| Flusso operativo | Funzionale ma visivamente denso | Schermate `Situazione → Messaggio → Tono → Risultato` più ariose |

## Verifiche eseguite

| Test | Esito | Evidenza |
|---|---:|---|
| Build produzione `npm run build` | Superato | Vite build completata senza errori |
| Screenshot mobile Playwright 390×844 | Superato | `qa/mobile-redesign-playwright.png` |
| Overflow orizzontale mobile | Superato | `innerWidth=390`, `scrollWidth=390`, nessun offender |
| Smoke test flusso principale | Superato | Home → campo messaggio → tono → trasformazione/stato risultato |

## Risultato smoke test

```json
{
  "results": [
    { "step": "Home caricata con CTA principale", "ok": true },
    { "step": "CTA Inizia subito porta al campo messaggio", "ok": true },
    { "step": "Inserimento messaggio porta alla scelta tono", "ok": true },
    { "step": "Selezione tono base avvia trasformazione o risultato", "ok": true }
  ],
  "overflow": {
    "innerWidth": 390,
    "scrollWidth": 390,
    "bodyScrollWidth": 390
  }
}
```

## Nota separata sulle sitemap

Poiché è stato segnalato che Search Console mostra ancora **“Impossibile recuperare”** dopo 48 ore, è stato fatto un controllo HTTP non invasivo sulle due sitemap live:

| URL | HTTP | Content-Type | Coerenza URL interni |
|---|---:|---|---|
| `https://con-text-app.vercel.app/sitemap.xml` | 200 | `application/xml` | corretta |
| `https://con-text-app.vercel.app/sitemap-20260611.xml` | 200 | `application/xml` | corretta |

Dal lato server le sitemap risultano raggiungibili e formalmente servite come XML. Se Search Console continua a mostrare l'errore, il problema sembra più legato alla rielaborazione/lettura di Google o a uno stato interno della proprietà, non a un blocco HTTP evidente della sitemap.

## File utili prodotti

| File | Scopo |
|---|---|
| `qa/mobile_redesign_plan_2026-06-15.md` | Piano visivo mobile-first |
| `qa/mobile_redesign_visual_findings_2026-06-15.md` | Evidenze visive durante la correzione responsive |
| `qa/mobile-redesign-playwright.png` | Screenshot mobile finale affidabile |
| `qa/check_mobile_layout.cjs` | Verifica overflow e screenshot Playwright |
| `qa/smoke_mobile_flow.cjs` | Smoke test funzionale del flusso principale |
