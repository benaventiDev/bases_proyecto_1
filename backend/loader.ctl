LOAD DATA
CHARACTERSET UTF8
INFILE 'DB_Excel.csv'
APPEND INTO TABLE temp
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
TRAILING NULLCOLS
(
NOMBRE_VICTIMA CHAR(100),
APELLIDO_VICTIMA CHAR(100),
DIRECCION_VICTIMA CHAR(100),
FECHA_PRIMERA_SOSPECHA CHAR(100),
FECHA_CONFIRMACION CHAR(100),
FECHA_MUERTE CHAR(100),
ESTADO_VICTIMA CHAR(100),
NOMBRE_ASOCIADO CHAR(100),
APELLIDO_ASOCIADO CHAR(100),
FECHA_CONOCIO CHAR(100),
CONTACTO_FISICO CHAR(100),
FECHA_INICIO_CONTACTO CHAR(100),
FECHA_FIN_CONTACTO CHAR(100),
NOMBRE_HOSPITAL CHAR(100),
DIRECCION_HOSPITAL CHAR(100),
UBICACION_VICTIMA CHAR(100),
FECHA_LLEGADA CHAR(100),
FECHA_RETIRO CHAR(100),
TRATAMIENTO CHAR(100),
EFECTIVIDAD CHAR(100),
FECHA_INICIO_TRATAMIENTO CHAR(100),
FECHA_FIN_TRATAMIENTO CHAR(100),
EFECTIVIDAD_EN_VICTIMA CHAR(100)
)
