import { test, expect } from '@playwright/test';

test('all election comparisons and state comparison', async ({ page }) => {
  const errors: string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/comparador');
  for (const [initial,final] of [[1,2],[2,1],[1,3],[3,1],[2,3],[3,2]]) {
    await page.locator('select').nth(0).selectOption(String(initial));
    await page.locator('select').nth(1).selectOption(String(final));
    await page.getByRole('button',{name:'Comparar',exact:true}).click();
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(2);
    await expect(page.getByText('MÉXICO (NACIONAL)',{exact:true})).toBeVisible();
  }
  await page.locator('select').nth(2).selectOption('9');
  await page.getByRole('button',{name:'Comparar',exact:true}).click();
  await expect(page.getByText('CIUDAD DE MÉXICO',{exact:true}).last()).toBeVisible();
  await page.locator('select').nth(0).selectOption('3');
  await page.locator('select').nth(1).selectOption('3');
  await expect(page.getByRole('button',{name:'Comparar',exact:true})).toBeDisabled();
  expect(errors).toEqual([]);
});

test('year selectors, persisted theme and malformed saved user', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('user','not valid JSON'); localStorage.setItem('theme','dark'); });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass('dark');
  for (const year of ['1','2','3']) {
    await page.locator('select').selectOption(year);
    await expect(page.locator('.leaflet-interactive')).toHaveCount(32);
    await expect(page.locator('.recharts-line')).toHaveCount(1);
    await expect(page.locator('main')).not.toContainText(/Ã|�|Â/);
    if (year==='1') await expect(page.locator('main')).toContainText('N/D');
    else await expect(page.locator('main')).not.toContainText('N/D');
  }
  await page.goto('/explorador');
  await page.getByRole('button',{name:'Ver ficha'}).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Cerrar ficha'}).click();
  await page.locator('select').selectOption('1');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Ver ficha'})).toHaveCount(32);
});

test('connection failure has a readable message', async ({ page }) => {
  await page.route('**/api/v1/elecciones',route=>route.abort());
  await page.goto('/');
  await expect(page.getByText('No se pudo conectar al servidor. Comprueba que la API esté iniciada.')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Panel General'})).toBeVisible();
});
