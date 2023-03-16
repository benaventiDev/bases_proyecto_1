--Creacion de Main Tables

DROP TABLE victima_asociado_contacto;
DROP TABLE victima_asociado;
DROP TABLE ubicacion_victima;
DROP TABLE tratamiento_victima;
DROP TABLE hospital_visita;
DROP TABLE hospital_sede;
DROP TABLE victima;
DROP TABLE estado;
DROP TABLE hospital;
DROP TABLE contacto;
DROP TABLE ubicacion;
DROP TABLE tratamiento;
DROP TABLE asociado;




CREATE TABLE estado (
    id_estado   NUMBER GENERATED ALWAYS AS IDENTITY,
    descripcion VARCHAR2(50) NOT NULL,
    CONSTRAINT pk_estado PRIMARY KEY (id_estado),
    CONSTRAINT uq_estado UNIQUE (descripcion)
);


CREATE TABLE contacto (
    id_contacto           NUMBER GENERATED ALWAYS AS IDENTITY,
    contacto_tipo         VARCHAR2(50) NOT NULL,
    fecha_inicio_contacto TIMESTAMP NOT NULL,
    fecha_fin_contacto    TIMESTAMP NOT NULL,
    CONSTRAINT pk_contacto PRIMARY KEY (id_contacto),
    CONSTRAINT uq_contacto UNIQUE (contacto_tipo, fecha_inicio_contacto, fecha_fin_contacto)
    
);

CREATE TABLE victima (
    id_victima             NUMBER GENERATED ALWAYS AS IDENTITY,
    nombre_victima         VARCHAR2(100) NOT NULL,
    apellido_victima       VARCHAR2(100) NOT NULL,
    direccion_victima      VARCHAR2(150),
    fecha_primera_sospecha TIMESTAMP NOT NULL,
    fecha_confirmacion     TIMESTAMP NOT NULL,
    fecha_muerte           TIMESTAMP,
    id_estado   		   NUMBER NOT NULL,
    CONSTRAINT pk_victima PRIMARY KEY (id_victima),
    CONSTRAINT fk_estado_v FOREIGN KEY (id_estado) REFERENCES estado (id_estado),
    CONSTRAINT uq_victima_nombre_apellido UNIQUE (nombre_victima, apellido_victima)
);

CREATE TABLE ubicacion (
    id_ubicacion NUMBER GENERATED ALWAYS AS IDENTITY,
    descripcion  VARCHAR2(100) NOT NULL,
    CONSTRAINT pk_ubicacion PRIMARY KEY (id_ubicacion)
);



CREATE TABLE tratamiento (
    id_tratamiento NUMBER GENERATED ALWAYS AS IDENTITY,
    nombre         VARCHAR2(50) NOT NULL,
    efectividad    NUMBER NOT NULL,
    CONSTRAINT pk_tratamiento PRIMARY KEY (id_tratamiento),
    CONSTRAINT uq_tratamiento UNIQUE (nombre, efectividad)
);

CREATE TABLE hospital (
    id_hospital NUMBER GENERATED ALWAYS AS IDENTITY,
    nombre      VARCHAR2(100) NOT NULL,
    CONSTRAINT pk_hospital PRIMARY KEY (id_hospital),
    CONSTRAINT uq_hospital UNIQUE (nombre)
);


CREATE TABLE asociado (
    id_asociado NUMBER GENERATED ALWAYS AS IDENTITY,
    nombre      VARCHAR2(50) NOT NULL,
    apellido    VARCHAR2(50) NOT NULL,
    CONSTRAINT pk_asociado PRIMARY KEY (id_asociado),
    CONSTRAINT uq_asociado UNIQUE (nombre, apellido)
);


CREATE TABLE hospital_sede (
    id_hospital_sede     NUMBER GENERATED ALWAYS AS IDENTITY,
    direccion            VARCHAR2(100) NOT NULL,
    id_hospital 		NUMBER NOT NULL,
    CONSTRAINT pk_hospital_sede PRIMARY KEY (id_hospital_sede),
    CONSTRAINT fk_id_hospital_sh FOREIGN KEY (id_hospital) REFERENCES hospital (id_hospital),
    CONSTRAINT uq_hospital_sede UNIQUE (id_hospital_sede, direccion)
);


CREATE TABLE ubicacion_victima (
    ubicacion_victima_id   	NUMBER GENERATED ALWAYS AS IDENTITY,
    fecha_llegada          	TIMESTAMP NOT NULL,
    fecha_retiro           	TIMESTAMP NOT NULL,
    id_victima     			NUMBER NOT NULL,
    id_ubicacion 			NUMBER NOT NULL,
    CONSTRAINT pk_ubicacion_victima PRIMARY KEY (ubicacion_victima_id),
    CONSTRAINT fk_victima_ub FOREIGN KEY (id_victima) REFERENCES victima (id_victima),
    CONSTRAINT fk_ubicacion_ub FOREIGN KEY (id_ubicacion) REFERENCES ubicacion (id_ubicacion)
);


CREATE TABLE tratamiento_victima (
    id_tratamiento_victima     	NUMBER GENERATED ALWAYS AS IDENTITY,
    fecha_inicio_tratamiento   	TIMESTAMP NOT NULL,
    fecha_fin_tratamiento      	TIMESTAMP NOT NULL,
    efectividad_en_victima     	NUMBER, --NOT NULL,
    id_victima         			NUMBER NOT NULL,
    id_tratamiento 				NUMBER NOT NULL,
    CONSTRAINT pk_id_tratamiento_victima PRIMARY KEY (id_tratamiento_victima),
    CONSTRAINT fk_victima_tv FOREIGN KEY (id_victima) REFERENCES victima (id_victima),
    CONSTRAINT fk_tratamiento_tv FOREIGN KEY (id_tratamiento) REFERENCES tratamiento (id_tratamiento)
);

CREATE TABLE hospital_visita (
    id_victima             	NUMBER NOT NULL,
    id_hospital_sede 		NUMBER NOT NULL,
    CONSTRAINT pk_hospital_visita PRIMARY KEY (id_victima, id_hospital_sede),
    CONSTRAINT fk_victima_hv FOREIGN KEY (id_victima) REFERENCES victima (id_victima),
    CONSTRAINT fk_hospital_sede_hv FOREIGN KEY (id_hospital_sede) REFERENCES hospital_sede (id_hospital_sede)

);


CREATE TABLE victima_asociado (
    fecha_conocio        	TIMESTAMP NOT NULL,
    id_victima   			NUMBER NOT NULL,
    id_asociado 			NUMBER NOT NULL,
    CONSTRAINT pk_victima_asociado PRIMARY KEY (id_victima, id_asociado),
    CONSTRAINT fk_victima_va FOREIGN KEY (id_victima) REFERENCES victima (id_victima),
    CONSTRAINT fk_asociado_va FOREIGN KEY (id_asociado) REFERENCES asociado (id_asociado)
);


CREATE TABLE victima_asociado_contacto (
    id_contacto             NUMBER NOT NULL, 
    id_victima   			NUMBER NOT NULL, 
    id_asociado 			NUMBER NOT NULL,
    CONSTRAINT pk_victima_asociado_contacto PRIMARY KEY (id_contacto, id_victima, id_asociado),
    CONSTRAINT fk_contacto_vac FOREIGN KEY (id_contacto) REFERENCES contacto (id_contacto),
    CONSTRAINT fk_victima_vac FOREIGN KEY (id_victima) REFERENCES victima (id_victima),
    CONSTRAINT fk_asociado_vac FOREIGN KEY (id_asociado) REFERENCES asociado (id_asociado)
);