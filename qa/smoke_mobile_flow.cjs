const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);

  const results = [];
  async function step(name, fn) {
    try {
      await fn();
      results.push({ step: name, ok: true });
    } catch (error) {
      results.push({ step: name, ok: false, error: error.message });
    }
  }

  await step('Home caricata con CTA principale', async () => {
    await page.getByRole('button', { name: /inizia subito/i }).waitFor({ timeout: 5000 });
  });

  await step('CTA Inizia subito porta al campo messaggio', async () => {
    await page.getByRole('button', { name: /inizia subito/i }).click();
    await page.getByRole('textbox').waitFor({ timeout: 5000 });
  });

  await step('Inserimento messaggio porta alla scelta tono', async () => {
    await page.getByRole('textbox').fill('Ciao, non avete ancora pagato la fattura e ho bisogno di una risposta chiara ma cortese.');
    await page.getByRole('button', { name: /scegli il tono/i }).click();
    await page.getByText(/che impressione vuoi dare/i).waitFor({ timeout: 5000 });
  });

  await step('Selezione tono base avvia trasformazione o risultato', async () => {
    const toneButtons = page.locator('.tone-grid').first().locator('button');
    await toneButtons.first().click();
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    if (!/sto riscrivendo|messaggio pronto|credito|gratis|errore/i.test(bodyText)) {
      throw new Error('Dopo la selezione tono non appare alcuno stato atteso');
    }
  });

  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth
  }));

  console.log(JSON.stringify({ results, overflow }, null, 2));
  const failed = results.filter(r => !r.ok);
  await browser.close();
  if (failed.length) process.exit(1);
})();
