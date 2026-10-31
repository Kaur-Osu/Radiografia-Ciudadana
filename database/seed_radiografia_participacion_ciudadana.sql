-- =============================================================================
-- Radiografía de Participación Ciudadana — Seed de datos iniciales
-- Archivo: seed_radiografia_participacion_ciudadana.sql
-- Descripción: Datos de catálogo y prueba para poblar la base de datos vacía
-- sin depender del ETL completo de los CSV oficiales del INE.
-- =============================================================================

USE radiografia_ciudadana;

-- -----------------------------------------------------------------------------
-- 1. Elecciones (MVP: 2018, 2021, 2024)
-- -----------------------------------------------------------------------------
INSERT INTO elecciones (anio, nombre, tipo, fecha_eleccion, descripcion, activa) VALUES
(2018, 'Elección federal 2018', 'FEDERAL', '2018-07-01', 'Elección de Presidente, Senadores y Diputados Federales 2018.', TRUE),
(2021, 'Elección federal 2021', 'FEDERAL', '2021-06-06', 'Elección de Diputados Federales 2021.', TRUE),
(2024, 'Elección federal 2024', 'FEDERAL', '2024-06-02', 'Elección de Presidente, Senadores y Diputados Federales 2024.', TRUE);

-- -----------------------------------------------------------------------------
-- 2. Versiones cartográficas
-- -----------------------------------------------------------------------------
INSERT INTO versiones_cartograficas (nombre, fecha_corte, descripcion) VALUES
('Cartografía Electoral INE 2023', '2023-05-01', 'Marco cartográfico electoral con corte a mayo de 2023, según publicación oficial del INE.');

-- -----------------------------------------------------------------------------
-- 3. Territorios — Entidades federativas (claves INE)
-- -----------------------------------------------------------------------------
INSERT INTO territorios (clave, nombre, tipo, version_cartografica_id, padre_id) VALUES
('01', 'AGUASCALIENTES', 'ENTIDAD', 1, NULL),
('02', 'BAJA CALIFORNIA', 'ENTIDAD', 1, NULL),
('03', 'BAJA CALIFORNIA SUR', 'ENTIDAD', 1, NULL),
('04', 'CAMPECHE', 'ENTIDAD', 1, NULL),
('05', 'COAHUILA', 'ENTIDAD', 1, NULL),
('06', 'COLIMA', 'ENTIDAD', 1, NULL),
('07', 'CHIAPAS', 'ENTIDAD', 1, NULL),
('08', 'CHIHUAHUA', 'ENTIDAD', 1, NULL),
('09', 'CIUDAD DE MÉXICO', 'ENTIDAD', 1, NULL),
('10', 'DURANGO', 'ENTIDAD', 1, NULL),
('11', 'GUANAJUATO', 'ENTIDAD', 1, NULL),
('12', 'GUERRERO', 'ENTIDAD', 1, NULL),
('13', 'HIDALGO', 'ENTIDAD', 1, NULL),
('14', 'JALISCO', 'ENTIDAD', 1, NULL),
('15', 'ESTADO DE MÉXICO', 'ENTIDAD', 1, NULL),
('16', 'MICHOACÁN', 'ENTIDAD', 1, NULL),
('17', 'MORELOS', 'ENTIDAD', 1, NULL),
('18', 'NAYARIT', 'ENTIDAD', 1, NULL),
('19', 'NUEVO LEÓN', 'ENTIDAD', 1, NULL),
('20', 'OAXACA', 'ENTIDAD', 1, NULL),
('21', 'PUEBLA', 'ENTIDAD', 1, NULL),
('22', 'QUERÉTARO', 'ENTIDAD', 1, NULL),
('23', 'QUINTANA ROO', 'ENTIDAD', 1, NULL),
('24', 'SAN LUIS POTOSÍ', 'ENTIDAD', 1, NULL),
('25', 'SINALOA', 'ENTIDAD', 1, NULL),
('26', 'SONORA', 'ENTIDAD', 1, NULL),
('27', 'TABASCO', 'ENTIDAD', 1, NULL),
('28', 'TAMAULIPAS', 'ENTIDAD', 1, NULL),
('29', 'TLAXCALA', 'ENTIDAD', 1, NULL),
('30', 'VERACRUZ', 'ENTIDAD', 1, NULL),
('31', 'YUCATÁN', 'ENTIDAD', 1, NULL),
('32', 'ZACATECAS', 'ENTIDAD', 1, NULL),
('00', 'MÉXICO (NACIONAL)', 'NACIONAL', 1, NULL);

-- -----------------------------------------------------------------------------
-- 4. Grupos demográficos
-- -----------------------------------------------------------------------------
INSERT INTO grupos_demograficos (dimension, codigo, nombre, descripcion, orden) VALUES
('SEXO', 'H', 'Hombres', 'Personas del sexo masculino según el cuadernillo de la lista nominal.', 1),
('SEXO', 'M', 'Mujeres', 'Personas del sexo femenino según el cuadernillo de la lista nominal.', 2),
('SEXO', 'NB', 'No binario', 'Personas registradas como no binario en la fuente oficial.', 3),
('EDAD', '18_24', '18 a 24 años', 'Rango de edad de 18 a 24 años cumplidos al día de la elección.', 1),
('EDAD', '25_34', '25 a 34 años', 'Rango de edad de 25 a 34 años cumplidos al día de la elección.', 2),
('EDAD', '35_44', '35 a 44 años', 'Rango de edad de 35 a 44 años cumplidos al día de la elección.', 3),
('EDAD', '45_59', '45 a 59 años', 'Rango de edad de 45 a 59 años cumplidos al día de la elección.', 4),
('EDAD', '60_mas', '60 años y más', 'Rango de edad de 60 años en adelante.', 5),
('TIPO_SECCION', 'U', 'Urbana', 'Sección electoral clasificada como urbana.', 1),
('TIPO_SECCION', 'M', 'Mixta', 'Sección electoral clasificada como mixta.', 2),
('TIPO_SECCION', 'R', 'Rural', 'Sección electoral clasificada como rural.', 3);

-- -----------------------------------------------------------------------------
-- 5. Segmentos demográficos
-- -----------------------------------------------------------------------------
INSERT INTO segmentos_demograficos (codigo, descripcion, es_general) VALUES
('GENERAL', 'Población general sin desagregación demográfica.', TRUE),
('SEXO_H', 'Hombres.', FALSE),
('SEXO_M', 'Mujeres.', FALSE),
('EDAD_18_24', 'Personas de 18 a 24 años.', FALSE),
('EDAD_25_34', 'Personas de 25 a 34 años.', FALSE),
('TIPO_SECCION_U', 'Secciones urbanas.', FALSE),
('TIPO_SECCION_R', 'Secciones rurales.', FALSE);

-- -----------------------------------------------------------------------------
-- 6. Relaciones segmento-categorías (solo para segmentos no generales)
-- -----------------------------------------------------------------------------
INSERT INTO segmento_categorias (segmento_id, grupo_demografico_id) VALUES
(2, 1),
(3, 2),
(4, 4),
(5, 5),
(6, 9),
(7, 11);

-- -----------------------------------------------------------------------------
-- 7. Fuentes de datos (registro inicial)
-- -----------------------------------------------------------------------------
INSERT INTO fuentes_datos (institucion, nombre, descripcion, url_oficial, fecha_publicacion, fecha_descarga, version) VALUES
('INE', 'Conteo Censal de Participación Ciudadana 2024', 'Datos abiertos del INE sobre participación ciudadana por sección, entidad, municipio, distrito, sexo, edad y tipo de sección.', 'https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/', NULL, NOW(), '2024');

-- -----------------------------------------------------------------------------
-- 8. Metodologías base
-- -----------------------------------------------------------------------------
INSERT INTO metodologias (nombre, version, descripcion, formula, limitaciones, activa) VALUES
('Participación porcentual', '1.0', 'Participación = (Votantes / Electores) × 100. Abstención = 100 - Participación.', '(SV / LN) × 100', 'No contempla voto en casillas especiales ni mexicanas y mexicanos residentes en el extranjero.', TRUE),
('Variación histórica en puntos porcentuales', '1.0', 'Variación = Participación final - Participación inicial. Se expresa en puntos porcentuales (pp), no en porcentaje relativo.', 'P_final - P_inicial', 'Solo válida entre elecciones con indicadores y territorios compatibles.', TRUE),
('Clasificación básica de perfiles', '1.0', 'Reglas basadas en umbrales de nivel relativo y variación histórica.', 'Reglas condicionales sobre diferencia vs referencia y variación pp.', 'Umbrales definidos semialmente; requieren validación con análisis exploratorio.', TRUE);

-- -----------------------------------------------------------------------------
-- 9. Perfiles descriptivos (MVP inicial: 3 perfiles)
-- -----------------------------------------------------------------------------
INSERT INTO perfiles (codigo, nombre, descripcion, activo) VALUES
('PERF-01', 'Participación alta respecto a la referencia', 'Participación al menos 5 pp por encima de la referencia nacional, sin cambio mayor de 3 pp cuando existe elección previa.', TRUE),
('PERF-02', 'Participación en crecimiento', 'Territorios con incremento relevante de participación entre elecciones.', TRUE),
('PERF-03', 'Participación en descenso', 'Territorios con disminución relevante de participación entre elecciones.', TRUE),
('PERF-04', 'Participación baja respecto a la referencia', 'Participación al menos 5 pp por debajo de la referencia nacional, sin crecimiento o descenso superior a 3 pp.', TRUE),
('PERF-05', 'Participación próxima a la referencia', 'Diferencia menor a 5 pp respecto a la referencia nacional, sin crecimiento o descenso superior a 3 pp.', TRUE);

-- -----------------------------------------------------------------------------
-- 10. Reglas de perfil (ejemplo ilustrativo)
-- -----------------------------------------------------------------------------
INSERT INTO reglas_perfil (perfil_id, codigo_regla, version, parametros_json, descripcion, activa) VALUES
(1, 'ALTA_ESTABLE', 1,
 '{"indicador": "diferencia_referencia_pp", "operador": ">=", "umbral": 5, "indicador_variacion": "variacion_pp", "umbral_variacion": 3, "unidad": "puntos_porcentuales"}',
 'Participación al menos 5 pp por encima de la referencia y variación absoluta ≤ 3 pp.', TRUE),
(2, 'CRECIMIENTO', 1,
 '{"indicador": "variacion_pp", "operador": ">", "umbral": 3, "unidad": "puntos_porcentuales"}',
 'Variación histórica superior a +3 pp.', TRUE),
(3, 'DESCENSO', 1,
 '{"indicador": "variacion_pp", "operador": "<", "umbral": -3, "unidad": "puntos_porcentuales"}',
 'Variación histórica inferior a -3 pp.', TRUE);

-- -----------------------------------------------------------------------------
-- La aplicación pública no requiere cuenta ni usuario administrador.
