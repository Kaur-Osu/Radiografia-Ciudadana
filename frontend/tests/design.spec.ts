import { test, expect } from '@playwright/test';

test('motion preference, focus and current navigation state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.recharts-line')).toHaveCount(1);
  const animation = await page.locator('.route-view').evaluate(element => parseFloat(getComputedStyle(element).animationDuration));
  expect(animation).toBeLessThanOrEqual(0.001);
  await expect(page.getByRole('link', { name: 'Inicio', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Comparador Histórico' }).click();
  await expect(page.getByRole('link', { name: 'Comparador Histórico', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Tab');
  const focusVisible = await page.evaluate(() => !!document.activeElement?.matches(':focus-visible'));
  expect(focusVisible).toBe(true);
});

test('theme preserves readable foreground and navigation contrast', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.recharts-line')).toHaveCount(1);
  for (let i = 0; i < 2; i++) {
    const contrast = await page.locator('.nav-link[aria-current="page"]').evaluate(element => {
      const fg = getComputedStyle(element).color.match(/[\d.]+/g)!.slice(0,3).map(Number);
      const bg = getComputedStyle(document.querySelector('.primary-navigation')!).backgroundColor.match(/[\d.]+/g)!.slice(0,3).map(Number);
      const luminance = (color: number[]) => color.map(value => { const c=value/255; return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4; }).reduce((sum,c,index) => sum+c*[0.2126,0.7152,0.0722][index],0);
      const a=luminance(fg), b=luminance(bg);return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    await page.getByRole('button', { name: 'Alternar tema claro/oscuro' }).click();
    await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished)));
  }
});

test('map stays fitted after a desktop to mobile resize', async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/');
  await expect(page.locator('.leaflet-interactive')).toHaveCount(32);
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('.leaflet-interactive')).toHaveCount(32);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('.map-shell').scrollIntoViewIfNeeded();
  const visiblePolygons = await page.locator('.leaflet-interactive').evaluateAll(polygons => {
    const map=document.querySelector('.leaflet-container')!.getBoundingClientRect();
    return polygons.filter(polygon => {const box=polygon.getBoundingClientRect();return box.right>map.left&&box.left<map.right&&box.bottom>map.top&&box.top<map.bottom;}).length;
  });
  expect(visiblePolygons).toBe(32);
});
