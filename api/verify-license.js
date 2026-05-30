const GUMROAD_VERIFY_URL = 'https://api.gumroad.com/v2/licenses/verify';

function splitEnvList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getGumroadProductIdentifiers() {
  const productIds = [
    ...splitEnvList(process.env.GUMROAD_PRODUCT_IDS),
    ...splitEnvList(process.env.GUMROAD_PRODUCT_ID),
  ].map((value) => ({ type: 'product_id', value }));

  const legacyPermalinks = [
    ...splitEnvList(process.env.GUMROAD_PRODUCT_PERMALINKS),
    ...splitEnvList(process.env.GUMROAD_PRODUCT_PERMALINK),
  ].map((value) => ({ type: 'product_permalink', value }));

  return [...productIds, ...legacyPermalinks];
}

async function verifyGumroadLicense(identifier, licenseKey) {
  const form = new URLSearchParams();
  form.set(identifier.type, identifier.value);
  form.set('license_key', licenseKey);

  const response = await fetch(GUMROAD_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!response.ok) {
    return { success: false, status: response.status };
  }

  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey } = req.body || {};
  const trimmedLicenseKey = String(licenseKey || '').trim();

  if (!trimmedLicenseKey) {
    return res.status(400).json({ valid: false, error: 'Codice licenza mancante' });
  }

  const normalizedLicenseKey = trimmedLicenseKey.toUpperCase();
  const lifetimeCodes = splitEnvList(process.env.FREE_LIFETIME_CODES).map((code) => code.toUpperCase());

  if (lifetimeCodes.includes(normalizedLicenseKey)) {
    return res.status(200).json({
      valid: true,
      licenseKey: normalizedLicenseKey,
      purchase: {
        email: null,
        productName: 'ConText Pro Lifetime',
        refunded: false,
        chargebacked: false,
        source: 'lifetime-code',
      }
    });
  }

  const gumroadProducts = getGumroadProductIdentifiers();

  if (gumroadProducts.length === 0) {
    return res.status(501).json({
      valid: false,
      error: 'Verifica licenza non configurata. Imposta GUMROAD_PRODUCT_IDS su Vercel.'
    });
  }

  try {
    for (const product of gumroadProducts) {
      const data = await verifyGumroadLicense(product, trimmedLicenseKey);

      if (!data.success || !data.purchase) {
        continue;
      }

      const refunded = Boolean(data.purchase.refunded);
      const chargebacked = Boolean(data.purchase.chargebacked);

      if (refunded || chargebacked) {
        return res.status(200).json({
          valid: false,
          error: 'Licenza non più valida perché il pagamento risulta rimborsato o contestato.'
        });
      }

      return res.status(200).json({
        valid: true,
        licenseKey: trimmedLicenseKey,
        purchase: {
          email: data.purchase.email || null,
          productName: data.purchase.product_name || 'ConText',
          productId: data.purchase.product_id || product.value,
          refunded,
          chargebacked,
          source: 'gumroad-license',
        }
      });
    }

    return res.status(200).json({ valid: false, error: 'Licenza non valida' });
  } catch (error) {
    return res.status(500).json({ valid: false, error: 'Errore verifica licenza' });
  }
}
