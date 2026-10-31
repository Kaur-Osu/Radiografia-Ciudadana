import { test, expect } from '@playwright/test';

for(const width of [320,768]) test(`state dialog fits ${width}px and keeps keyboard focus`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/explorador');
  await page.getByRole('row').filter({hasText:'ESTADO DE MÉXICO'}).getByRole('button',{name:'Ver ficha'}).click();
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  const overflow=await dialog.locator('.grid > div').evaluateAll(cards=>cards.filter(card=>card.scrollWidth>card.clientWidth).length);
  expect(overflow).toBe(0);
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate(e=>e.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
});
