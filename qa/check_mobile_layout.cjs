const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);
  await page.screenshot({ path: '/home/ubuntu/work/ConText-app/qa/mobile-redesign-playwright.png', fullPage: false });
  const report = await page.evaluate(() => {
    const vw = window.innerWidth;
    const offenders = [...document.querySelectorAll('body *')]
      .map(el => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, cls: String(el.className || ''), text: (el.innerText || el.alt || '').slice(0, 70), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
      })
      .filter(x => x.right > vw + 1 || x.left < -1)
      .slice(0, 20);
    return {
      innerWidth: window.innerWidth,
      docClientWidth: document.documentElement.clientWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenders
    };
  });
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
