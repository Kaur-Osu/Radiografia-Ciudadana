-- =============================================================================
-- Radiografía de Participación Ciudadana — Schema de Base de Datos MySQL 8.0
-- Archivo: schema_radiografia_participacion_ciudadana.sql
-- Descripción: Modelo relacional completo para almacenar, analizar y visualizar
-- los Conteos Censales de Participación Ciudadana del INE.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS radiografia_ciudadana
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE radiografia_ciudadana;

-- -----------------------------------------------------------------------------
-- 1. CATÁLOGOS
-- -----------------------------------------------------------------------------

-- Tabla: elecciones
CREATE TABLE elecciones (
    id INT NOT NULL AUTO_INCREMENT,
    anio SMALLINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'FEDERAL',
    fecha_eleccion DATE NULL,
    descripcion TEXT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_elecciones_anio (anio),
    INDEX idx_elecciones_activa (activa)
) ENGINE=InnoDB;

-- Tabla: versiones_cartograficas
CREATE TABLE versiones_cartograficas (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    fecha_corte DATE NULL,
    fuente_id BIGINT NULL,
    descripcion TEXT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Tabla: territorios
CREATE TABLE territorios (
    id BIGINT NOT NULL AUTO_INCREMENT,
    clave VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(30) NOT NULL COMMENT 'ENTIDAD, MUNICIPIO, DISTRITO_FEDERAL, DISTRITO_LOCAL, SECCION, NACIONAL',
    version_cartografica_id INT NULL,
    geometria JSON NULL COMMENT 'GeoJSON simplificado almacenado como JSON',
    padre_id BIGINT NULL COMMENT 'Referencia opcional a territorio padre',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_territorios_clave_tipo_version (clave, tipo, version_cartografica_id),
    INDEX idx_territorios_tipo (tipo),
    INDEX idx_territorios_padre (padre_id),
    CONSTRAINT fk_territorios_version FOREIGN KEY (version_cartografica_id)
        REFERENCES versiones_cartograficas(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_territorios_padre FOREIGN KEY (padre_id)
        REFERENCES territorios(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: grupos_demograficos
CREATE TABLE grupos_demograficos (
    id INT NOT NULL AUTO_INCREMENT,
    dimension VARCHAR(40) NOT NULL COMMENT 'SEXO, EDAD, TIPO_SECCION, INDIGENA, AFRODESCENDIENTE',
    codigo VARCHAR(40) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    orden INT NOT NULL DEFAULT 0,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_grupos_dimension_codigo (dimension, codigo),
    INDEX idx_grupos_dimension (dimension)
) ENGINE=InnoDB;

-- Tabla: segmentos_demograficos
CREATE TABLE segmentos_demograficos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(100) NOT NULL UNIQUE COMMENT 'Código legible del segmento, ej: GENERAL, SEXO_H, EDAD_18_24, SEXO_M_EDAD_18_24',
    descripcion VARCHAR(200) NULL,
    es_general BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'True si representa la población general sin desagregación',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_segmentos_es_general (es_general)
) ENGINE=InnoDB;

-- Tabla: segmento_categorias
CREATE TABLE segmento_categorias (
    segmento_id BIGINT NOT NULL,
    grupo_demografico_id INT NOT NULL,
    fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (segmento_id, grupo_demografico_id),
    CONSTRAINT fk_sc_segmento FOREIGN KEY (segmento_id)
        REFERENCES segmentos_demograficos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sc_grupo FOREIGN KEY (grupo_demografico_id)
        REFERENCES grupos_demograficos(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: fuentes_datos
CREATE TABLE fuentes_datos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    institucion VARCHAR(150) NOT NULL DEFAULT 'INE',
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del archivo o conjunto de datos',
    descripcion TEXT NULL,
    url_oficial TEXT NULL,
    nombre_archivo VARCHAR(255) NULL,
    hash_sha256 CHAR(64) NULL COMMENT 'Hash del archivo original para trazabilidad de versión',
    fecha_publicacion DATE NULL,
    fecha_descarga DATETIME NULL,
    version VARCHAR(50) NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_fuentes_hash (hash_sha256),
    INDEX idx_fuentes_nombre (nombre)
) ENGINE=InnoDB;

-- Tabla: metodologias
CREATE TABLE metodologias (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    version VARCHAR(30) NOT NULL DEFAULT '1.0',
    descripcion TEXT NULL,
    formula TEXT NULL,
    limitaciones TEXT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uk_metodologias_nombre_version (nombre, version),
    INDEX idx_metodologias_activa (activa)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. DATOS ELECTORALES (TABLA CENTRAL)
-- -----------------------------------------------------------------------------

-- Tabla: participacion_electoral
CREATE TABLE participacion_electoral (
    id BIGINT NOT NULL AUTO_INCREMENT,
    eleccion_id INT NOT NULL,
    territorio_id BIGINT NOT NULL,
    segmento_id BIGINT NOT NULL,
    fuente_id BIGINT NOT NULL,
    lote_importacion_id BIGINT NULL,
    electores BIGINT NOT NULL DEFAULT 0 COMMENT 'Lista nominal / universo de referencia',
    votantes BIGINT NOT NULL DEFAULT 0 COMMENT 'Registros con marca de voto (SV)',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_participacion_eleccion_territorio_segmento (eleccion_id, territorio_id, segmento_id),
    INDEX idx_participacion_eleccion (eleccion_id),
    INDEX idx_participacion_territorio (territorio_id),
    INDEX idx_participacion_segmento (segmento_id),
    INDEX idx_participacion_fuente (fuente_id),
    INDEX idx_participacion_consulta (eleccion_id, segmento_id, territorio_id),
    CONSTRAINT fk_participacion_eleccion FOREIGN KEY (eleccion_id)
        REFERENCES elecciones(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_participacion_territorio FOREIGN KEY (territorio_id)
        REFERENCES territorios(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_participacion_segmento FOREIGN KEY (segmento_id)
        REFERENCES segmentos_demograficos(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_participacion_fuente FOREIGN KEY (fuente_id)
        REFERENCES fuentes_datos(id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_participacion_electores_no_negativo CHECK (electores >= 0),
    CONSTRAINT chk_participacion_votantes_no_negativo CHECK (votantes >= 0),
    CONSTRAINT chk_participacion_votantes_menor_igual_electores CHECK (votantes <= electores)
) ENGINE=InnoDB;

-- Tabla: indicadores_calculados
CREATE TABLE indicadores_calculados (
    id BIGINT NOT NULL AUTO_INCREMENT,
    eleccion_id INT NOT NULL,
    territorio_id BIGINT NOT NULL,
    segmento_id BIGINT NOT NULL,
    codigo_indicador VARCHAR(50) NOT NULL COMMENT 'PARTICIPACION, ABSTENCION, etc.',
    valor DECIMAL(12,4) NOT NULL,
    metodologia_id INT NOT NULL,
    fecha_calculo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_indicadores_eleccion_territorio_segmento_codigo (eleccion_id, territorio_id, segmento_id, codigo_indicador),
    INDEX idx_indicadores_eleccion (eleccion_id),
    INDEX idx_indicadores_codigo (codigo_indicador),
    CONSTRAINT fk_indicadores_eleccion FOREIGN KEY (eleccion_id)
        REFERENCES elecciones(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_indicadores_territorio FOREIGN KEY (territorio_id)
        REFERENCES territorios(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_indicadores_segmento FOREIGN KEY (segmento_id)
        REFERENCES segmentos_demograficos(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_indicadores_metodologia FOREIGN KEY (metodologia_id)
        REFERENCES metodologias(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla: comparaciones_historicas
CREATE TABLE comparaciones_historicas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    eleccion_inicial_id INT NOT NULL,
    eleccion_final_id INT NOT NULL,
    territorio_id BIGINT NOT NULL,
    segmento_id BIGINT NOT NULL,
    participacion_inicial DECIMAL(7,4) NULL,
    participacion_final DECIMAL(7,4) NULL,
    variacion_pp DECIMAL(8,4) NULL,
    metodologia_id INT NOT NULL,
    estado_compatibilidad VARCHAR(30) NOT NULL DEFAULT 'COMPATIBLE' COMMENT 'COMPATIBLE, INCOMPATIBLE, ADVERTENCIA',
    fecha_calculo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_comparaciones (eleccion_inicial_id, eleccion_final_id, territorio_id, segmento_id),
    INDEX idx_comparaciones_territorio (territorio_id),
    INDEX idx_comparaciones_elecciones (eleccion_inicial_id, eleccion_final_id),
    CONSTRAINT fk_comp_eleccion_inicial FOREIGN KEY (eleccion_inicial_id)
        REFERENCES elecciones(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_comp_eleccion_final FOREIGN KEY (eleccion_final_id)
        REFERENCES elecciones(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_comp_territorio FOREIGN KEY (territorio_id)
        REFERENCES territorios(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_comp_segmento FOREIGN KEY (segmento_id)
        REFERENCES segmentos_demograficos(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_comp_metodologia FOREIGN KEY (metodologia_id)
        REFERENCES metodologias(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. MOTOR DE PERFILES DESCRIPTIVOS
-- -----------------------------------------------------------------------------

-- Tabla: perfiles
CREATE TABLE perfiles (
    id INT NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'PERF-01, PERF-02, etc.',
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_perfiles_activo (activo)
) ENGINE=InnoDB;

-- Tabla: reglas_perfil
CREATE TABLE reglas_perfil (
    id BIGINT NOT NULL AUTO_INCREMENT,
    perfil_id INT NOT NULL,
    codigo_regla VARCHAR(50) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    parametros_json JSON NULL COMMENT 'Umbrales y operadores de clasificación',
    descripcion TEXT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_reglas_perfil_codigo_version (perfil_id, codigo_regla, version),
    INDEX idx_reglas_perfil_activa (activa),
    CONSTRAINT fk_reglas_perfil_perfil FOREIGN KEY (perfil_id)
        REFERENCES perfiles(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla: perfiles_asignados
CREATE TABLE perfiles_asignados (
    id BIGINT NOT NULL AUTO_INCREMENT,
    territorio_id BIGINT NOT NULL,
    perfil_id INT NOT NULL,
    eleccion_referencia_id INT NOT NULL,
    regla_id BIGINT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    indicadores_json JSON NULL COMMENT 'Valores calculados que sustentan la asignación',
    explicacion TEXT NULL,
    fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_perfiles_asignados_territorio_eleccion_principal (territorio_id, eleccion_referencia_id, es_principal),
    INDEX idx_perfiles_asignados_perfil (perfil_id),
    INDEX idx_perfiles_asignados_territorio (territorio_id),
    CONSTRAINT fk_pa_territorio FOREIGN KEY (territorio_id)
        REFERENCES territorios(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_pa_perfil FOREIGN KEY (perfil_id)
        REFERENCES perfiles(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_pa_eleccion_referencia FOREIGN KEY (eleccion_referencia_id)
        REFERENCES elecciones(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_pa_regla FOREIGN KEY (regla_id)
        REFERENCES reglas_perfil(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: ejecuciones_analisis
CREATE TABLE ejecuciones_analisis (
    id BIGINT NOT NULL AUTO_INCREMENT,
    tipo_analisis VARCHAR(40) NOT NULL COMMENT 'INDICADORES, COMPARACIONES, PERFILES, HALLAZGOS',
    version_algoritmo VARCHAR(30) NOT NULL DEFAULT '1.0',
    parametros_json JSON NULL,
    fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'EJECUTANDO' COMMENT 'EJECUTANDO, COMPLETADA, FALLIDA',
    registros_procesados BIGINT NOT NULL DEFAULT 0,
    mensaje_error TEXT NULL,
    PRIMARY KEY (id),
    INDEX idx_ejecuciones_tipo_estado (tipo_analisis, estado)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. HALLAZGOS
-- -----------------------------------------------------------------------------

-- Tabla: hallazgos
CREATE TABLE hallazgos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NULL,
    interpretacion TEXT NULL,
    limitaciones TEXT NULL,
    posibles_acciones TEXT NULL,
    territorio_id BIGINT NULL,
    eleccion_id INT NULL,
    perfil_id INT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR' COMMENT 'BORRADOR, EN_REVISION, RECHAZADO, APROBADO, PUBLICADO',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_publicacion DATETIME NULL,
    autor_id INT NULL,
    PRIMARY KEY (id),
    INDEX idx_hallazgos_estado (estado),
    INDEX idx_hallazgos_territorio (territorio_id),
    INDEX idx_hallazgos_eleccion (eleccion_id),
    CONSTRAINT fk_h_territorio FOREIGN KEY (territorio_id)
        REFERENCES territorios(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_h_eleccion FOREIGN KEY (eleccion_id)
        REFERENCES elecciones(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_h_perfil FOREIGN KEY (perfil_id)
        REFERENCES perfiles(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: hallazgo_evidencias
CREATE TABLE hallazgo_evidencias (
    id BIGINT NOT NULL AUTO_INCREMENT,
    hallazgo_id BIGINT NOT NULL,
    indicador_id BIGINT NULL,
    comparacion_id BIGINT NULL,
    descripcion TEXT NULL,
    PRIMARY KEY (id),
    INDEX idx_he_hallazgo (hallazgo_id),
    CONSTRAINT fk_he_hallazgo FOREIGN KEY (hallazgo_id)
        REFERENCES hallazgos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_he_indicador FOREIGN KEY (indicador_id)
        REFERENCES indicadores_calculados(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_he_comparacion FOREIGN KEY (comparacion_id)
        REFERENCES comparaciones_historicas(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. LOTES DE IMPORTACIÓN Y AUDITORÍA
-- -----------------------------------------------------------------------------

-- Tabla: lotes_importacion
CREATE TABLE lotes_importacion (
    id BIGINT NOT NULL AUTO_INCREMENT,
    fuente_id BIGINT NOT NULL,
    usuario_id INT NULL,
    fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME NULL,
    registros_leidos BIGINT NOT NULL DEFAULT 0,
    registros_validos BIGINT NOT NULL DEFAULT 0,
    registros_rechazados BIGINT NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'EN_PROCESO' COMMENT 'EN_PROCESO, COMPLETADO, RECHAZADO, PARCIAL',
    errores_json JSON NULL,
    PRIMARY KEY (id),
    INDEX idx_lotes_estado (estado),
    CONSTRAINT fk_li_fuente FOREIGN KEY (fuente_id)
        REFERENCES fuentes_datos(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla: usuarios (seguridad y administración)
CREATE TABLE usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'ADMIN' COMMENT 'ADMIN, PUBLICO',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_usuarios_correo (correo),
    INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB;

-- Tabla: auditoría
CREATE TABLE auditoria (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id INT NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(100) NOT NULL,
    entidad_id BIGINT NULL,
    detalles_json JSON NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_auditoria_fecha (fecha),
    INDEX idx_auditoria_usuario (usuario_id),
    INDEX idx_auditoria_entidad (entidad, entidad_id),
    CONSTRAINT fk_aud_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- COMENTARIOS DE TABLAS PARA DOCUMENTACIÓN
-- -----------------------------------------------------------------------------

ALTER TABLE elecciones COMMENT = 'Catálogo de elecciones disponibles (2009, 2012, 2015, 2018, 2021, 2024).';
ALTER TABLE territorios COMMENT = 'Unidades territoriales con claves INE oficiales.';
ALTER TABLE grupos_demograficos COMMENT = 'Dimensiones y categorías demográficas (sexo, edad, tipo de sección).';
ALTER TABLE segmentos_demograficos COMMENT = 'Combinaciones válidas de categorías demográficas.';
ALTER TABLE participacion_electoral COMMENT = 'Tabla central: conteos oficiales de electores y votantes por elección, territorio y segmento.';
ALTER TABLE perfiles COMMENT = 'Catálogo de perfiles descriptivos de participación.';
ALTER TABLE perfiles_asignados COMMENT = 'Asignación de perfiles a territorios con regla y explicación.';
ALTER TABLE hallazgos COMMENT = 'Fichas de hallazgos estadísticos con interpretación y limitaciones.';

-- =============================================================================
-- FIN DEL SCHEMA
-- =============================================================================