# Frontend

React, TypeScript, Vite, Tailwind CSS 4, Recharts y Leaflet.

```powershell
npm ci
npm run dev
npm run build
npm run lint
```

`VITE_API_BASE_URL=/api/v1` usa el proxy local de Vite y el proxy de producción de Nginx. No configures `localhost` como destino público del API en el VPS.

Para ejecutar las pruebas, inicia la API con la base oficial cargada y la interfaz en el puerto 5174. Después ejecuta `npm run test:e2e`. Se usa Chrome instalado en Windows y se guardan capturas en `test-results/`.
