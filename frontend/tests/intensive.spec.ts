import { test, expect } from '@playwright/test';

const routes=['/','/explorador','/comparador','/perfiles','/metodologia'];
for(const width of [320,390,768,1024,1440]) for(const theme of ['light','dark']) for(const route of routes) {
  test(`layout ${width}px ${theme} ${route}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.addInitScript(value=>localStorage.setItem('theme',value),theme);
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(route);
    await expect(page.locator('main h1')).toBeVisible();
    if(route==='/')await expect(page.locator('.recharts-line')).toHaveCount(1);
    if(route==='/explorador')await expect(page.getByRole('button',{name:'Ver ficha'})).toHaveCount(32);
    if(route==='/perfiles') {
      await page.locator('select').nth(1).selectOption('9');
      await expect(page.getByText('Diagnóstico Cívico: CIUDAD DE MÉXICO')).toBeVisible();
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(errors).toEqual([]);
  });
}

test('malformed geometry cannot crash the entire application',async({page})=>{
  await page.route('**/mexico_entidades_simplificado.geojson',r=>r.fulfill({json:{type:'FeatureCollection',features:Array.from({length:32},(_,i)=>({type:'Feature',properties:{clave_entidad:String(i+1)},geometry:{type:'Polygon',coordinates:[[[[-102,20],[-101,20],[-101,21],[-102,20]]]]}}))}}));
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText(/mapa|Geometr/);
  await expect(page.getByRole('heading',{name:'Panel General'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('missing history does not hide available current election indicators',async({page})=>{
  await page.route('**/participacion/territorio/0/historico',r=>r.fulfill({status:404,json:{detail:'No hay datos históricos para este territorio'}}));
  await page.goto('/');
  await expect(page.getByText('98,330,348',{exact:true})).toBeVisible();
  await expect(page.locator('.leaflet-interactive')).toHaveCount(32);
  await expect(page.getByText('Sin datos históricos disponibles')).toBeVisible();
});

test('empty catalogues provide a clear empty state',async({page})=>{
  await page.route('**/api/v1/elecciones',r=>r.fulfill({json:[]}));
  for(const route of routes.slice(0,4)) {
    await page.goto(route);
    await expect(page.locator('main')).toContainText(/No hay elecciones disponibles/);
  }
});

test('form selectors have accessible names',async({page})=>{
  for(const route of routes.slice(0,4)) {
    await page.goto(route);
    await expect(page.locator('main h1')).toBeVisible();
    const selects=page.locator('main select');
    for(let i=0;i<await selects.count();i++) await expect(selects.nth(i)).toHaveAccessibleName(/.+/);
  }
});

test('stale profile request cannot replace the latest selection',async({page})=>{
  let release:()=>void=()=>{};
  const hold=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/perfiles/territorio/1?*',async r=>{const response=await r.fetch();await hold;await r.fulfill({response});});
  await page.goto('/perfiles');
  await page.locator('select').nth(1).selectOption('1');
  await page.locator('select').nth(1).selectOption('9');
  await expect(page.getByText('Diagnóstico Cívico: CIUDAD DE MÉXICO')).toBeVisible();
  release();
  await page.unrouteAll({ behavior: 'wait' });
  await expect(page.getByText('Diagnóstico Cívico: AGUASCALIENTES')).toHaveCount(0);
});

test('all 96 state profiles render without runtime errors',async({page})=>{
  test.setTimeout(90000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/perfiles');
  for(const year of ['1','2','3']) {
    await page.locator('select').first().selectOption(year);
    for(let i=1;i<=32;i++) {
      await page.locator('select').nth(1).selectOption(String(i));
      await expect(page.getByText('Diagnóstico Cívico:',{exact:false})).toBeVisible();
      await expect(page.locator('.recharts-radar-polygon')).toHaveCount(1);
    }
  }
  expect(errors).toEqual([]);
});

test('HTML instead of JSON shows an error instead of an endless spinner',async({page})=>{
  await page.route('**/api/v1/elecciones',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body>Proxy error</body></html>'}));
  await page.goto('/');
  await expect(page.getByText('El servidor devolvió datos inválidos. Intenta recargar la página.')).toBeVisible();
});

test('incomplete comparison response cannot produce a blank page',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/participacion/comparar?*',r=>r.fulfill({json:{participacion_inicial:50,participacion_final:60}}));
  await page.goto('/comparador');
  await page.locator('select').nth(0).selectOption('1');await page.locator('select').nth(1).selectOption('3');
  await page.getByRole('button',{name:'Comparar',exact:true}).click();
  await expect(page.getByText('El servidor devolvió datos inválidos. Intenta recargar la página.')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Comparador Histórico'})).toBeVisible();
  expect(errors).toEqual([]);
});
