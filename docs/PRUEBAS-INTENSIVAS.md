# Pruebas intensivas y correcciones adicionales

Fecha: 30 de octubre de 2026.
Proyecto revisado: `C:\radiografia-ciudadana-main`.

## Resultado final

**Sin fallos pendientes en la batería ejecutada:** 244 pruebas de backend, 65 pruebas de navegador en Chrome y las mismas 65 en Edge. Las pruebas de navegador utilizaron los archivos compilados de producción, servidos localmente en el puerto 5175.

También se completaron 1,000 solicitudes HTTP reales sin errores, se validaron de nuevo los 28,455,354 registros oficiales y se verificó la restauración del respaldo SQL en una base temporal.

Este resultado describe la cobertura realizada; no constituye una garantía de ausencia de cualquier defecto posible. El despliegue al VPS continúa pendiente.

## Problemas encontrados y corregidos

1. Algunas consultas asumían que el segmento GENERAL tenía identificador 1. La comparación y los perfiles ahora lo resuelven por su código, y se prueban con identificadores distintos en una base aislada.
2. La comparación por POST etiquetaba cualquier segmento como GENERAL. Ahora devuelve los metadatos reales del segmento solicitado y coincide con el contrato de la consulta por GET.
3. El agregado nacional contaba filas en vez de comprobar las 32 claves distintas. Ahora rechaza el caso de un estado duplicado que sustituye a otro ausente.
4. Los perfiles podían interpretar un denominador cero como participación cero. Ahora se informa que no hay datos suficientes.
5. El importador podía omitir filas sin nombre de entidad debido a la agrupación de datos. Ahora rechaza esas fuentes explícitamente.
6. Conteos fuera del rango de enteros podían desbordarse al convertirlos. Se validan el formato, el rango, los componentes y las sumas antes de agregar datos.
7. Los selectores del explorador y de perfiles desbordaban en móviles de 320 px y en ciertas distribuciones de tableta. Se corrigió su distribución y se probaron 320, 390, 768, 1024 y 1440 px, en ambos temas.
8. Una geometría mal formada podía dejar la página en blanco. Se validan las claves y las coordenadas antes de entregar las geometrías al mapa; los errores quedan limitados al componente del mapa.
9. La ausencia de histórico ocultaba los indicadores actuales. Las cargas se resuelven de forma independiente y se mantienen visibles los datos disponibles.
10. Los catálogos vacíos no siempre mostraban una explicación. Ahora las pantallas presentan un mensaje claro.
11. Varios selectores carecían de nombre accesible. Se añadieron nombres para su uso mediante herramientas de accesibilidad.
12. Las respuestas HTML o JSON incompleto podían causar cargas indefinidas o errores de renderizado. Se valida la estructura de las respuestas y se muestra un error comprensible.
13. Las cifras grandes se desbordaban en fichas de móviles y el foco podía salir del diálogo al pulsar Tab. Se ajustaron las columnas y se mantiene el foco dentro del diálogo, con cierre mediante Escape.

## Cobertura del backend

- Las seis comparaciones ordenadas entre las tres elecciones, para el nivel nacional y las 32 entidades: **198 casos**, comprobando además el signo de la comparación inversa.
- Indicadores y perfiles de todas las entidades en las tres elecciones.
- Segmentos e identificadores alternativos, estados duplicados, población cero y separación de niveles territoriales.
- Entradas inválidas, solicitudes incompletas y valores extremos sin errores de servidor.
- Rechazo de archivos incompletos, estados duplicados, conteos negativos, decimales, no numéricos y fuera de rango.
- Fallo simulado a mitad de una importación: se comprobó la reversión de todos los cambios de esa elección.
- Importación repetida en una base aislada: se comprobó que actualiza los mismos registros y no duplica población.
- Lecturas concurrentes de la API mediante 200 peticiones con 12 trabajadores.

Las pruebas con datos adversos y las simulaciones de fallos se ejecutaron en SQLite aislado. La matriz con datos oficiales y la prueba de carga HTTP usaron MySQL mediante consultas de lectura; no se alteraron los conteos oficiales.

## Cobertura del navegador

Se ejecutaron **65 escenarios en Chrome y 65 en Edge**, incluyendo las cinco pantallas públicas en cinco resoluciones y ambos temas. Se verificaron navegación, mapas, gráficas, las seis comparaciones, los 96 perfiles, fichas con cifras grandes, foco del teclado, cierre con Escape, cambios de elección, limpieza, preferencias persistidas, respuestas tardías, conexión fallida, ausencia de histórico, catálogos vacíos y respuestas dañadas.

Se comprobaron también la compilación de producción, el análisis del código del frontend y la compatibilidad de dependencias de Python.

## Carga HTTP real

| Medida | Resultado local |
|---|---:|
| Solicitudes | 1000 |
| Concurrencia máxima | 20 |
| Respuestas con error | 0 |
| Tiempo total | 12.116 s |
| Mediana | 0.169 s |
| Percentil 95 | 0.612 s |
| Mayor tiempo observado | 1.586 s |

Los tiempos corresponden a este equipo y a esta carga; no equivalen a una medición del futuro VPS.

## Fuentes y respaldo

Las reglas más estrictas volvieron a procesar **28,455,354 registros** de los 96 CSV oficiales y produjeron exactamente los mismos resultados que la validación anterior.

El respaldo SQL se restauró en una base nueva y temporal. Se comprobaron los 96 totales, las sumas de electores y votantes, las 32 geometrías válidas y los acentos. Al terminar se eliminó únicamente la base temporal creada por esa prueba.

## Límites comprobados

Firefox se descargó, pero Windows impidió su arranque antes de abrir la aplicación. El registro de Windows identifica una dependencia de instalación ausente: el ensamblado `mozglue`. Sus escenarios no se cuentan como ejecutados ni aprobados. Chrome y Edge sí ejecutaron toda la batería; ambos comparten el motor Chromium.

Docker, Nginx dentro del contenedor, el dominio y HTTPS deben comprobarse en la fase del VPS; no hay Docker instalado en este equipo. La compilación web de producción y la API se verificaron localmente. La compilación conserva una advertencia de tamaño de paquete y las pruebas Python una advertencia de obsolescencia de su cliente HTTP; no produjeron fallos de compilación, ejecución o datos.
