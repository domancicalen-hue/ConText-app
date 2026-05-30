export default async function handler(req, res) {
  const raw = req.query?.p || req.query?.pack || '200';
  const pack = String(raw).trim();
  const links = {
    '50': process.env.CHECKOUT_50_URL,
    '200': process.env.CHECKOUT_200_URL,
    '500': process.env.CHECKOUT_500_URL,
  };
  const url = links[pack];
  if (!['50', '200', '500'].includes(pack)) {
    return res.status(400).send('Pacchetto non valido.');
  }
  if (!url) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(503).send(`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Checkout ConText</title><style>body{margin:0;background:#07070e;color:#f0ece4;font-family:system-ui;padding:48px;line-height:1.6}.card{max-width:680px;margin:auto;border:1px solid #24243a;border-radius:18px;padding:28px;background:#0f0f1c}a{color:#c8a84b}</style></head><body><div class="card"><h1>Checkout quasi pronto</h1><p>Il pacchetto da ${pack} crediti è configurato nel sito. Manca solo il link reale del provider di pagamento nelle variabili Vercel.</p><p>Imposta <strong>CHECKOUT_${pack}_URL</strong> con il link Gumroad o Stripe, poi ripubblica.</p><p><a href="/crediti.html">Torna ai crediti</a></p></div></body></html>`);
  }
  return res.redirect(302, url);
}
