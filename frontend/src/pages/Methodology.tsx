export function Methodology() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Fuentes y Metodología</h1>
        <p className="text-gray-600 dark:text-slate-300">
          Conoce el origen de la información y comprende cómo se generaron los resultados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card title="Fuente de Información">
            <div className="space-y-4">
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Los datos provienen de los <strong>Conteos Censales de Participación Ciudadana</strong>
                del Instituto Nacional Electoral (INE).
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Elecciones incluidas: <strong>2018, 2021 y 2024</strong> (procesos federales).
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Las fuentes incluyen municipio, distrito, sección, sexo y edad. Esta aplicación presenta agregados por entidad federativa y a nivel nacional. El mapa usa límites del Marco Geoestadístico del INEGI, simplificados para visualización; no reemplaza la cartografía electoral histórica.
              </p>
              <a
                href="https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                Ver fuente oficial <span>→</span>
              </a>
            </div>
          </Card>

          <Card title="Definición de Indicadores">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="text-xs text-gray-500 uppercase mb-2 dark:text-slate-400">Fórmula de Participación</div>
                <div className="font-mono text-sm">Participación = (Votantes / Electores) × 100</div>
                <div className="text-xs text-gray-500 mt-2 dark:text-slate-400">
                  Donde "Votantes" = registros con marca de voto (SV) y "Electores" = lista nominal (LN).
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="text-xs text-gray-500 uppercase mb-2 dark:text-slate-400">Complemento de participación</div>
                <div className="font-mono text-sm">Sin marca de voto = 100 - Participación</div>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="text-xs text-gray-500 uppercase mb-2 dark:text-slate-400">Variación Histórica</div>
                <div className="font-mono text-sm">Variación = P_final - P_inicial</div>
                <div className="text-xs text-gray-500 mt-2 dark:text-slate-400">
                  Se expresa en <strong>puntos porcentuales (pp)</strong>, no en porcentaje relativo.
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Limitaciones Metodológicas">
            <ul className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
              <li className="flex gap-2">
                <span className="text-red-500">⚠</span>
                Se utiliza LN como denominador y SV como numerador. El complemento incluye NV (no votaron) y NS (no especificado), por lo que no equivale exclusivamente a abstención observada.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">⚠</span>
                La referencia de la sección corresponde al lugar de residencia en la credencial electoral.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">⚠</span>
                Los cambios de delimitación territorial entre elecciones pueden afectar comparaciones.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">⚠</span>
                Las correlaciones no demuestran causalidad.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">⚠</span>
                Los perfiles son categorías descriptivas, no predicciones electorales.
              </li>
            </ul>
          </Card>

          <Card title="Transparencia y Reproducibilidad">
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Cada resultado muestra sus fuentes y metodología. Los indicadores pueden recalcularse
                con los scripts de importación incluidos en el proyecto.
              </p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="text-xs text-gray-500 uppercase mb-2 dark:text-slate-400">Principios</div>
                <ul className="text-sm text-gray-700 space-y-1 dark:text-slate-300">
                  <li>• Transparencia: fuentes y metodología visibles en cada resultado</li>
                  <li>• Neutralidad: sin recomendaciones partidistas ni predicciones</li>
                  <li>• Accesibilidad: explicaciones para usuarios no especializados</li>
                  <li>• Reproducibilidad: reglas documentadas para recálculo</li>
                  <li>• Protección de datos: solo datos agregados, sin perfiles individuales</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 dark:bg-slate-900 dark:border-slate-700">
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-slate-100">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}