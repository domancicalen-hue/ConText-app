# Report aggiornamento logo e menù mobile — ConText

Data: 15 giugno 2026

## Obiettivo

L’intervento ha sostituito il logo visualizzato nell’app con una versione PNG pulita derivata dall’asset fornito dall’utente e ha trasformato la navigazione iniziale mobile in un menù compatto più professionale, con apertura tramite pulsante **Menu** in stile hamburger/close.

## Modifiche principali

| Area | Intervento | Esito |
|---|---|---|
| Logo header/app | Inserito asset `/icons/context-logo-user-transparent.png` nel brand e nello splash | Logo presente e caricato correttamente |
| Asset PWA | Rigenerate versioni favicon/icon 64, 192 e 512 per coerenza con il logo fornito | Asset disponibili per browser e installazione |
| Menù mobile | Sostituita la fila compatta di pulsanti con pannello mobile apribile tramite `Menu` | Navigazione più ordinata e professionale |
| Cache PWA | Aggiornato service worker a `context-v18-user-logo-menu-20260615` | Riduce il rischio che smartphone/PWA mostrino logo vecchio |
| Funzioni app | Flusso principale lasciato invariato | Smoke test superato |

## Verifiche eseguite

| Test | Risultato |
|---|---|
| Build produzione `npm run build` | Superata |
| Viewport mobile 390 px | `scrollWidth=390`, nessun overflow orizzontale |
| Apertura menù mobile | Menù aperto correttamente, `offscreenCount=0` |
| Presenza logo nuovo | Confermata tramite selettore immagine dedicato |
| Flusso principale | **Inizia subito → messaggio → tono → risultato** operativo |

## Nota visiva

Lo screenshot di controllo `qa/mobile-logo-menu-open.png` mostra il logo su sfondo scuro, con il menù aperto in alto e le voci organizzate in modo più arioso. L’asset fornito era incorporato in un’immagine con sfondo a scacchi: è stata generata una versione trasparente per evitare che il pattern risulti visibile nel sito.
