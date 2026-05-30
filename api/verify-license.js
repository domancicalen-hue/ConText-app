export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey } = req.body || {};
  if (!licenseKey) {
    return res.status(400).json({ valid: false, error: 'Codice licenza mancante' });
  }

  const gumroadProductPermalink = process.env.GUMROAD_PRODUCT_PERMALINK;
  if (!gumroadProductPermalink) {
    return res.status(501).json({
      valid: false,
      error: 'Verifica licenza non configurata. Imposta GUMROAD_PRODUCT_PERMALINK su Vercel.'
    });
  }

  try {
    const form = new URLSearchParams();
    form.set('product_permalink', gumroadProductPermalink);
    form.set('license_key', licenseKey);

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = await response.json();

    if (!data.success || !data.purchase) {
      return res.status(200).json({ valid: false, error: 'Licenza non valida' });
    }

    return res.status(200).json({
      valid: true,
      licenseKey,
      purchase: {
        email: data.purchase.email,
        productName: data.purchase.product_name,
        refunded: data.purchase.refunded,
        chargebacked: data.purchase.chargebacked,
      }
    });
  } catch (error) {
    return res.status(500).json({ valid: false, error: 'Errore verifica licenza' });
  }
}
