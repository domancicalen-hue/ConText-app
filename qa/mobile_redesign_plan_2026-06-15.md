# Piano redesign mobile-first ConText — 15 giugno 2026

## Obiettivo

Rivoluzionare l'interfaccia mobile di ConText senza modificare la logica funzionale esistente. Il problema principale segnalato è che su smartphone la home appare troppo piccola, compatta e compressa in un'unica pagina. Il nuovo layout deve aumentare la leggibilità, dare maggiore rilievo alle sezioni strategiche e guidare l'utente verso il flusso principale: scegliere una situazione, scrivere il messaggio, selezionare il tono e copiare il risultato.

## Principi di redesign

| Area | Decisione |
|---|---|
| Header | Rendere il brand più compatto e i link secondari meno dominanti, mantenendo Blog, Guida, Attiva, Condividi, Installa, contatore e Crediti accessibili. |
| Step bar | Sostituire l'aspetto tecnico e piccolo con una barra più leggibile, con fase attiva evidente e microcopy contestuale. |
| Home | Separare chiaramente hero, proof/trust, esempio prima/dopo e scelta situazione. La CTA principale deve apparire prima dei contenuti secondari. |
| Mobile | Usare spaziatura verticale più generosa, font minimi più grandi, card a piena larghezza, bottoni più alti e touch target comodi. |
| Sezioni importanti | Dare priorità a: promessa principale, prova gratuita, privacy/nessun account, esempio concreto, scelta situazione. |
| Funzionalità | Non cambiare nomi di stati, funzioni, chiamate API, paywall, installazione, condivisione, cronologia o gestione crediti. |

## Interventi previsti

1. Ampliare il sistema CSS con classi riutilizzabili per shell, header, stepper, hero, card, CTA e griglie responsive.
2. Convertire il layout della home da blocco compatto a percorso editoriale: hero forte, CTA primaria, trust cards, esempio evidenziato, poi scenari.
3. Rendere gli step 1, 2 e 3 più leggibili: textarea più ampia, toni in griglia 1 colonna su smartphone, risultato con gerarchia più chiara.
4. Conservare tutti gli handler esistenti: `pickScenario`, `skipScenario`, `goToTones`, `transform`, `copyResult`, `shareApp`, `installApp`, `restart`.
5. Verificare build e resa responsive dopo l'intervento.
