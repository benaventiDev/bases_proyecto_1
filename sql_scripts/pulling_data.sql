--estado
INSERT INTO estado(descripcion) SELECT DISTINCT  ESTADO_VICTIMA FROM TEMP WHERE ESTADO_VICTIMA IS NOT NULL;

--contacto
INSERT INTO contacto(contacto_tipo, fecha_inicio_contacto,  fecha_fin_contacto) SELECT DISTINCT  CONTACTO_FISICO, 
TO_TIMESTAMP(FECHA_INICIO_CONTACTO, 'MM/DD/YYYY HH24:MI'), TO_TIMESTAMP(FECHA_FIN_CONTACTO, 'MM/DD/YYYY HH24:MI') FROM TEMP WHERE CONTACTO_FISICO IS NOT NULL;

--victima
INSERT INTO victima(nombre_victima, apellido_victima, direccion_victima, fecha_primera_sospecha, fecha_confirmacion, fecha_muerte, id_estado)
SELECT DISTINCT  NOMBRE_VICTIMA, APELLIDO_VICTIMA, DIRECCION_VICTIMA, TO_TIMESTAMP(FECHA_PRIMERA_SOSPECHA, 'MM/DD/YYYY HH24:MI'), 
TO_TIMESTAMP(FECHA_CONFIRMACION, 'MM/DD/YYYY HH24:MI'), TO_TIMESTAMP(FECHA_MUERTE, 'MM/DD/YYYY HH24:MI'),
(SELECT id_estado FROM estado WHERE descripcion = TEMP.ESTADO_VICTIMA) AS id_estado FROM TEMP WHERE NOMBRE_VICTIMA IS NOT NULL AND APELLIDO_VICTIMA IS NOT NULL;

--ubicacion
INSERT INTO ubicacion(descripcion) SELECT DISTINCT UBICACION_VICTIMA FROM TEMP WHERE UBICACION_VICTIMA IS NOT NULL;

--tratamiento
INSERT INTO tratamiento(nombre, efectividad) SELECT DISTINCT TRATAMIENTO, EFECTIVIDAD FROM TEMP WHERE TRATAMIENTO IS NOT NULL;

--hospital
INSERT INTO hospital(nombre) SELECT DISTINCT NOMBRE_HOSPITAL FROM TEMP WHERE NOMBRE_HOSPITAL IS NOT NULL;

--asociado
INSERT INTO asociado(nombre, apellido) SELECT DISTINCT NOMBRE_ASOCIADO, APELLIDO_ASOCIADO FROM TEMP WHERE NOMBRE_ASOCIADO IS NOT NULL AND APELLIDO_ASOCIADO IS NOT NULL;

--hospital_sede
INSERT INTO hospital_sede(direccion, id_hospital) SELECT DISTINCT DIRECCION_HOSPITAL,
(SELECT id_hospital FROM hospital WHERE nombre = TEMP.NOMBRE_HOSPITAL) AS id_hospital 
FROM TEMP WHERE DIRECCION_HOSPITAL IS NOT NULL;

--hospital_visita
INSERT INTO hospital_visita (id_victima, id_hospital_sede)
SELECT DISTINCT v.id_victima, hs.id_hospital_sede
FROM victima v
INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
INNER JOIN hospital_sede hs ON hs.DIRECCION = t.DIRECCION_HOSPITAL AND hs.id_hospital = (SELECT id_hospital FROM hospital WHERE NOMBRE = t.NOMBRE_HOSPITAL)
INNER JOIN hospital h ON h.id_hospital = hs.id_hospital
WHERE t.DIRECCION_HOSPITAL IS NOT NULL AND t.NOMBRE_HOSPITAL IS NOT NULL;

--ubicacion_victima
INSERT INTO ubicacion_victima (fecha_llegada, fecha_retiro, id_victima, id_ubicacion)
SELECT DISTINCT  TO_TIMESTAMP(t.FECHA_LLEGADA, 'MM/DD/YYYY HH24:MI'), TO_TIMESTAMP(t.FECHA_RETIRO, 'MM/DD/YYYY HH24:MI'), v.id_victima, u.id_ubicacion
FROM victima v
INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
INNER JOIN UBICACION u ON u.DESCRIPCION = t.UBICACION_VICTIMA WHERE t.UBICACION_VICTIMA IS NOT NULL;

--tratamiento_victima
INSERT INTO tratamiento_victima(fecha_inicio_tratamiento, fecha_fin_tratamiento, efectividad_en_victima, id_victima, id_tratamiento)
SELECT DISTINCT TO_TIMESTAMP(t.FECHA_INICIO_TRATAMIENTO, 'MM/DD/YYYY HH24:MI'), TO_TIMESTAMP(t.FECHA_FIN_TRATAMIENTO, 'MM/DD/YYYY HH24:MI'), 
CASE WHEN REGEXP_LIKE(REGEXP_REPLACE(t.EFECTIVIDAD_EN_VICTIMA, '[^[:digit:]]', ''), '^[[:digit:]]+$')
THEN CAST(REGEXP_REPLACE(t.EFECTIVIDAD_EN_VICTIMA, '[^[:digit:]]', '') AS NUMBER) ELSE NULL END,
v.id_victima, tr.id_tratamiento
FROM victima v
INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
INNER JOIN TRATAMIENTO tr ON tr.NOMBRE = t.TRATAMIENTO;

--victima_asociado
INSERT INTO victima_asociado(fecha_conocio, id_victima, id_asociado)
SELECT DISTINCT tn.fecha_conocio, tn.id_victima, tn.id_asociado
FROM(
	SELECT DISTINCT v.id_victima, a.id_asociado,  MIN(TO_TIMESTAMP(t.FECHA_CONOCIO, 'MM/DD/YYYY HH24:MI')) AS fecha_conocio
	FROM victima v
	INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
	INNER JOIN asociado a ON a.NOMBRE  = t.NOMBRE_ASOCIADO  AND a.APELLIDO =  t.APELLIDO_ASOCIADO
  	--WHERE v.id_victima IS NOT NULL AND a.id_asociado IS NOT NULL 
	GROUP BY v.id_victima, a.id_asociado
) tn;

--victima_asociado-contacto  7280
INSERT INTO victima_asociado_contacto(id_contacto, id_victima, id_asociado)
SELECT DISTINCT tn.id_contacto, tn.id_victima, tn.id_asociado
FROM(
	SELECT DISTINCT c.id_contacto, v.id_victima, a.id_asociado
	FROM victima v
	INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
	INNER JOIN asociado a ON a.NOMBRE  = t.NOMBRE_ASOCIADO  AND a.APELLIDO =  t.APELLIDO_ASOCIADO
	INNER JOIN CONTACTO c ON  c.CONTACTO_TIPO = t.CONTACTO_FISICO AND c.CONTACTO_TIPO = t.CONTACTO_FISICO 
	AND c.FECHA_INICIO_CONTACTO = TO_TIMESTAMP(t.FECHA_INICIO_CONTACTO, 'MM/DD/YYYY HH24:MI') 
	AND c.FECHA_FIN_CONTACTO = TO_TIMESTAMP(t.FECHA_FIN_CONTACTO, 'MM/DD/YYYY HH24:MI')
) tn;
























--DELETE FROM victima;
--SELECT * FROM hospital_sede;
--SELECT COUNT(*) FROM hospital;



