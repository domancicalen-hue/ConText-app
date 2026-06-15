# Verifica visiva mobile — redesign ConText

Dagli screenshot mobile generati dopo il refactor emergono due miglioramenti già ottenuti: la home ha una gerarchia più chiara, CTA più evidente, card più leggibili e contenuti meno compressi rispetto alla versione precedente. Tuttavia la prima verifica a 390 px ha evidenziato alcune regressioni responsive da correggere prima della consegna.

| Area | Evidenza | Correzione richiesta |
|---|---|---|
| Header mobile | Le azioni superiori occupano più larghezza del viewport e alcuni pulsanti vengono tagliati. | Trasformare i link in griglia compatta o scroll controllato, evitando overflow nascosto. |
| Stepper | La quarta fase non è completamente visibile su 390 px. | Usare colonne `minmax(0, 1fr)`, ridurre letter spacing e permettere testi più compatti. |
| Hero title | La riga del titolo risulta troppo larga e viene tagliata a destra. | Ridurre il font mobile e forzare wrapping corretto con larghezza piena. |
| Lead text | Alcune righe sembrano tagliate dal contenitore a causa dell'overflow orizzontale complessivo. | Eliminare l'overflow generato dagli elementi a griglia e dai pulsanti nowrap. |

Queste correzioni sono puramente di layout/CSS e non devono modificare funzioni, stati o handler dell'applicazione.
