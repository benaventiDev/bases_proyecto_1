const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const { exec } = require('child_process');

/*
npm install oracledb
npm install cors
npm install express
sqlldr benaventi/benaventi@oracle:1521/ORCL18 control=../loader.ctl log=log.log
*/


oracledb.createPool({
    user: 'benaventi',
    password: 'benaventi',
    connectString: 'oracle:1521/ORCL18'
})
    .then(() => console.log('Oracle database connected'))
    .catch((err) => console.error(err));

const app = express();
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());



app.listen(5000, () => {
    console.log('El servidor ha iniciado');
});




app.get('/', (req, res) => {
    res.end('<h1>Hello World</h1>');
});


app.get('/consulta1', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT  h.NOMBRE, COUNT(*) AS cnt  FROM hospital_visita hv
        INNER JOIN VICTIMA v ON v.ID_VICTIMA = hv.ID_VICTIMA
        INNER JOIN HOSPITAL_SEDE hs ON hv.id_hospital_sede = hs.ID_HOSPITAL_SEDE 
        INNER JOIN HOSPITAL h ON h.ID_HOSPITAL = hs.ID_HOSPITAL
        WHERE v.FECHA_MUERTE IS NOT NULL
        GROUP BY h.NOMBRE
        ORDER BY h.NOMBRE ASC`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});

app.get('/consulta2', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT v.NOMBRE_VICTIMA , v.APELLIDO_VICTIMA, t.NOMBRE , tv.EFECTIVIDAD_EN_VICTIMA 
        FROM VICTIMA v 
        INNER JOIN TRATAMIENTO_VICTIMA tv ON tv.ID_VICTIMA = v.ID_VICTIMA 
        INNER JOIN TRATAMIENTO t ON t.ID_TRATAMIENTO = tv.ID_TRATAMIENTO 
        INNER JOIN ESTADO e ON e.ID_ESTADO = v.ID_ESTADO 
        WHERE t.NOMBRE = 'Transfusiones de sangre' AND tv.EFECTIVIDAD_EN_VICTIMA > 5 AND e.DESCRIPCION = 'En cuarentena'`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});

app.get('/consulta3', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, v.DIRECCION_VICTIMA --, COUNT(va.ID_VICTIMA) AS NUMERO_ASOCIADOS
        FROM VICTIMA v 
        INNER JOIN VICTIMA_ASOCIADO va ON va.ID_VICTIMA = v.ID_VICTIMA 
        WHERE v.FECHA_MUERTE IS NOT NULL
        GROUP BY  v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, v.DIRECCION_VICTIMA
        HAVING COUNT(va.ID_VICTIMA) > 3
        ORDER BY v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});


app.get('/consulta4', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA--, COUNT(v.ID_VICTIMA) AS asociado_count
        FROM VICTIMA v 
        INNER JOIN ESTADO e ON e.ID_ESTADO = v.ID_ESTADO 
        INNER JOIN VICTIMA_ASOCIADO_CONTACTO vac ON vac.ID_VICTIMA = v.ID_VICTIMA 
        INNER JOIN CONTACTO c ON c.ID_CONTACTO = vac.ID_CONTACTO 
        WHERE e.DESCRIPCION = 'Suspendida' AND c.CONTACTO_TIPO = 'Beso'
        GROUP BY  v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA 
        HAVING COUNT(v.ID_VICTIMA) > 2
        ORDER BY v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA ASC`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});


app.get('/consulta5', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT * FROM (
            SELECT v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA--, COUNT(v.ID_VICTIMA)
            FROM VICTIMA v 
            INNER JOIN TRATAMIENTO_VICTIMA tv ON tv.ID_VICTIMA  = v.ID_VICTIMA 
            INNER JOIN TRATAMIENTO t ON t.ID_TRATAMIENTO = tv.ID_TRATAMIENTO 
            WHERE t.NOMBRE = 'Oxigeno'
            GROUP BY v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA
            ORDER BY COUNT(v.ID_VICTIMA) DESC
        )
        where ROWNUM <= 5`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});


app.get('/consulta6', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, v.FECHA_MUERTE, u.DESCRIPCION, t.NOMBRE
        FROM VICTIMA v 
        INNER JOIN UBICACION_VICTIMA uv ON v.ID_VICTIMA = uv.ID_VICTIMA 
        INNER JOIN UBICACION u ON u.ID_UBICACION = uv.ID_UBICACION 
        INNER JOIN TRATAMIENTO_VICTIMA tv ON tv.ID_VICTIMA = v.ID_VICTIMA 
        INNER JOIN TRATAMIENTO t ON tv.ID_TRATAMIENTO = t.ID_TRATAMIENTO 
        WHERE u.DESCRIPCION = '1987 Delphine Well' AND t.NOMBRE = 'Manejo de la presion arterial' AND v.FECHA_MUERTE IS NOT NULL`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});


app.get('/consulta7', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA
        FROM VICTIMA v 
        INNER JOIN VICTIMA_ASOCIADO va ON va.ID_VICTIMA = v.ID_VICTIMA 
        INNER JOIN ASOCIADO a ON a.ID_ASOCIADO  = va.ID_ASOCIADO
        INNER JOIN TRATAMIENTO_VICTIMA tv ON tv.ID_VICTIMA = v.ID_VICTIMA 
        INNER JOIN TRATAMIENTO t ON t.ID_TRATAMIENTO = tv.ID_TRATAMIENTO
        GROUP BY  v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA
        HAVING COUNT(DISTINCT va.ID_ASOCIADO) < 2 AND COUNT(DISTINCT t.ID_TRATAMIENTO) = 2`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});


app.get('/consulta8', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT * FROM (
            SELECT v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, EXTRACT(MONTH FROM v.FECHA_PRIMERA_SOSPECHA) AS MES --,  COUNT(t.ID_TRATAMIENTO) AS NUM_TRATAMIENTOS
            FROM VICTIMA v 
            INNER JOIN TRATAMIENTO_VICTIMA tv ON tv.ID_VICTIMA = v.ID_VICTIMA 
            INNER JOIN TRATAMIENTO t ON t.ID_TRATAMIENTO = tv.ID_TRATAMIENTO 
            GROUP BY v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, v.FECHA_PRIMERA_SOSPECHA
            ORDER BY COUNT(t.ID_TRATAMIENTO)  DESC
            FETCH FIRST 5 ROWS ONLY
          ) 
          UNION ALL
          SELECT * FROM (
            SELECT v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, EXTRACT(MONTH FROM v.FECHA_PRIMERA_SOSPECHA) AS MES --,  COUNT(t.ID_TRATAMIENTO) AS NUM_TRATAMIENTOS
            FROM VICTIMA v 
            INNER JOIN TRATAMIENTO_VICTIMA tv ON tv.ID_VICTIMA = v.ID_VICTIMA 
            INNER JOIN TRATAMIENTO t ON t.ID_TRATAMIENTO = tv.ID_TRATAMIENTO 
            GROUP BY v.NOMBRE_VICTIMA, v.APELLIDO_VICTIMA, v.FECHA_PRIMERA_SOSPECHA
            ORDER BY COUNT(t.ID_TRATAMIENTO)  ASC
            FETCH FIRST 5 ROWS ONLY
          )`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});


app.get('/consulta9', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT h.NOMBRE,  ROUND (COUNT(v.ID_VICTIMA) * 100 / (SELECT COUNT(*) FROM (
            SELECT v.ID_VICTIMA, hs.ID_HOSPITAL
            FROM VICTIMA v 
            INNER JOIN hospital_visita hv ON hv.id_victima = v.ID_VICTIMA 
            INNER JOIN HOSPITAL_SEDE hs ON hs.ID_HOSPITAL_SEDE = hv.id_hospital_sede
            INNER JOIN HOSPITAL h ON h.ID_HOSPITAL = hs.ID_HOSPITAL
            GROUP BY v.ID_VICTIMA, hs.ID_HOSPITAL
            )), 2) AS PERCENTAGE
            FROM VICTIMA v 
            INNER JOIN hospital_visita hv ON hv.id_victima = v.ID_VICTIMA 
            INNER JOIN HOSPITAL_SEDE hs ON hs.ID_HOSPITAL_SEDE = hv.id_hospital_sede
            INNER JOIN HOSPITAL h ON h.ID_HOSPITAL = hs.ID_HOSPITAL
            GROUP BY h.NOMBRE`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});


app.get('/consulta10', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(`SELECT  tn.NOMBRE, tn.CONTACTO_TIPO,  ROUND( COUNT(v2.ID_VICTIMA) * 100 /(
            SELECT COUNT(v2.ID_VICTIMA) FROM (
            SELECT DISTINCT h.ID_HOSPITAL, h.NOMBRE, c.CONTACTO_TIPO, t.NUM_CONTACTOS, t.RANK
            FROM HOSPITAL h
            INNER JOIN HOSPITAL_SEDE hs ON hs.ID_HOSPITAL = h.ID_HOSPITAL 
            INNER JOIN hospital_visita hv ON hs.ID_HOSPITAL_SEDE = hv.id_hospital_sede
            INNER JOIN VICTIMA v ON hv.id_victima = v.ID_VICTIMA 
            INNER JOIN VICTIMA_ASOCIADO_CONTACTO vac ON vac.ID_VICTIMA = v.ID_VICTIMA 
            INNER JOIN CONTACTO c ON c.ID_CONTACTO = vac.ID_CONTACTO 
            INNER JOIN (
              SELECT h.ID_HOSPITAL, c.CONTACTO_TIPO, COUNT(*) AS NUM_CONTACTOS,
                ROW_NUMBER() OVER (PARTITION BY h.ID_HOSPITAL ORDER BY COUNT(*) DESC) AS RANK
              FROM HOSPITAL h
              INNER JOIN HOSPITAL_SEDE hs ON hs.ID_HOSPITAL = h.ID_HOSPITAL 
              INNER JOIN hospital_visita hv ON hs.ID_HOSPITAL_SEDE = hv.id_hospital_sede
              INNER JOIN VICTIMA v ON hv.id_victima = v.ID_VICTIMA 
              INNER JOIN VICTIMA_ASOCIADO_CONTACTO vac ON vac.ID_VICTIMA = v.ID_VICTIMA 
              INNER JOIN CONTACTO c ON c.ID_CONTACTO = vac.ID_CONTACTO 
              GROUP BY h.ID_HOSPITAL, c.CONTACTO_TIPO
            ) t ON t.ID_HOSPITAL = h.ID_HOSPITAL AND t.CONTACTO_TIPO = c.CONTACTO_TIPO AND t.RANK = 1
            ) tn
            INNER JOIN HOSPITAL_SEDE hs2 ON hs2.ID_HOSPITAL = tn.ID_HOSPITAL
            INNER JOIN hospital_visita hv2 ON hv2.id_hospital_sede = hs2.id_hospital_sede
            INNER JOIN VICTIMA v2 ON v2.ID_VICTIMA = hv2.ID_VICTIMA
            ),2 ) AS PORCENTAJE
            FROM (
            SELECT DISTINCT h.ID_HOSPITAL, h.NOMBRE, c.CONTACTO_TIPO, t.NUM_CONTACTOS, t.RANK
            FROM HOSPITAL h
            INNER JOIN HOSPITAL_SEDE hs ON hs.ID_HOSPITAL = h.ID_HOSPITAL 
            INNER JOIN hospital_visita hv ON hs.ID_HOSPITAL_SEDE = hv.id_hospital_sede
            INNER JOIN VICTIMA v ON hv.id_victima = v.ID_VICTIMA 
            INNER JOIN VICTIMA_ASOCIADO_CONTACTO vac ON vac.ID_VICTIMA = v.ID_VICTIMA 
            INNER JOIN CONTACTO c ON c.ID_CONTACTO = vac.ID_CONTACTO 
            INNER JOIN (
              SELECT h.ID_HOSPITAL, c.CONTACTO_TIPO, COUNT(*) AS NUM_CONTACTOS,
                ROW_NUMBER() OVER (PARTITION BY h.ID_HOSPITAL ORDER BY COUNT(*) DESC) AS RANK
              FROM HOSPITAL h
              INNER JOIN HOSPITAL_SEDE hs ON hs.ID_HOSPITAL = h.ID_HOSPITAL 
              INNER JOIN hospital_visita hv ON hs.ID_HOSPITAL_SEDE = hv.id_hospital_sede
              INNER JOIN VICTIMA v ON hv.id_victima = v.ID_VICTIMA 
              INNER JOIN VICTIMA_ASOCIADO_CONTACTO vac ON vac.ID_VICTIMA = v.ID_VICTIMA 
              INNER JOIN CONTACTO c ON c.ID_CONTACTO = vac.ID_CONTACTO 
              GROUP BY h.ID_HOSPITAL, c.CONTACTO_TIPO
            ) t ON t.ID_HOSPITAL = h.ID_HOSPITAL AND t.CONTACTO_TIPO = c.CONTACTO_TIPO AND t.RANK = 1
            ) tn
            INNER JOIN HOSPITAL_SEDE hs2 ON hs2.ID_HOSPITAL = tn.ID_HOSPITAL
            INNER JOIN hospital_visita hv2 ON hv2.id_hospital_sede = hs2.id_hospital_sede
            INNER JOIN VICTIMA v2 ON v2.ID_VICTIMA = hv2.ID_VICTIMA
            GROUP BY tn.NOMBRE, tn.CONTACTO_TIPO`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});


app.get('/cargarTemporal', async (req, res) => {
    var load_data_to_temp = exec('sh load_db.sh',
        async (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
            let conn;
            try {
                conn = await oracledb.getConnection();
                const result = await conn.execute('DELETE FROM TEMP  WHERE ESTADO_VICTIMA=\'ESTADO_VICTIMA\'');
                await conn.commit();
                res.end("Datos cargados");
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal server error');
            } finally {
                if (conn) {
                    await conn.close();
                }
            }
        });
});


app.get('/eliminarTemporal', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();

        const result = await conn.execute('DELETE FROM temp');
        await conn.commit();
        console.log('Datos eliminados');
        res.end('Datos eliminados');
        //res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        console.log('Closing connection')
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});

app.get('/eliminarModelo', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();

        await conn.execute('DROP TABLE victima_asociado_contacto');
        await conn.commit();
        await conn.execute('DROP TABLE victima_asociado');
        await conn.commit();
        await conn.execute('DROP TABLE ubicacion_victima');
        await conn.commit();
        await conn.execute('DROP TABLE tratamiento_victima');
        await conn.commit();
        await conn.execute('DROP TABLE hospital_visita');
        await conn.commit();
        await conn.execute('DROP TABLE hospital_sede');
        await conn.commit();
        await conn.execute('DROP TABLE victima');
        await conn.commit();
        await conn.execute('DROP TABLE estado');
        await conn.commit();
        await conn.execute('DROP TABLE hospital');
        await conn.commit();
        await conn.execute('DROP TABLE contacto');
        await conn.commit();
        await conn.execute('DROP TABLE ubicacion');
        await conn.commit();
        await conn.execute('DROP TABLE tratamiento');
        await conn.commit();
        await conn.execute('DROP TABLE asociado');
        await conn.commit();

        res.end('Tablas eliminadas');
        //res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        console.log('Closing connection')
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});
app.get('/cargarModelo', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection();

        await conn.execute(`CREATE TABLE estado (
            id_estado   NUMBER GENERATED ALWAYS AS IDENTITY,
            descripcion VARCHAR2(50) NOT NULL,
            CONSTRAINT pk_estado PRIMARY KEY (id_estado),
            CONSTRAINT uq_estado UNIQUE (descripcion)
        )
        `);
        await conn.commit();
        
        await conn.execute(`CREATE TABLE contacto (
            id_contacto           NUMBER GENERATED ALWAYS AS IDENTITY,
            contacto_tipo         VARCHAR2(50) NOT NULL,
            fecha_inicio_contacto TIMESTAMP NOT NULL,
            fecha_fin_contacto    TIMESTAMP NOT NULL,
            CONSTRAINT pk_contacto PRIMARY KEY (id_contacto),
            CONSTRAINT uq_contacto UNIQUE (contacto_tipo, fecha_inicio_contacto, fecha_fin_contacto)
            
        )
        `);
        await conn.commit();

        await conn.execute(`CREATE TABLE victima (
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
        )
        `);
        await conn.commit();

        await conn.execute(`CREATE TABLE ubicacion (
            id_ubicacion NUMBER GENERATED ALWAYS AS IDENTITY,
            descripcion  VARCHAR2(100) NOT NULL,
            CONSTRAINT pk_ubicacion PRIMARY KEY (id_ubicacion)
        )
        `);
        await conn.commit();

        await conn.execute(`CREATE TABLE tratamiento (
            id_tratamiento NUMBER GENERATED ALWAYS AS IDENTITY,
            nombre         VARCHAR2(50) NOT NULL,
            efectividad    NUMBER NOT NULL,
            CONSTRAINT pk_tratamiento PRIMARY KEY (id_tratamiento),
            CONSTRAINT uq_tratamiento UNIQUE (nombre, efectividad)
        )
        `);
        await conn.commit();

        await conn.execute(`CREATE TABLE hospital (
            id_hospital NUMBER GENERATED ALWAYS AS IDENTITY,
            nombre      VARCHAR2(100) NOT NULL,
            CONSTRAINT pk_hospital PRIMARY KEY (id_hospital),
            CONSTRAINT uq_hospital UNIQUE (nombre)
        )
        `);
        await conn.commit();

        await conn.execute(`CREATE TABLE asociado (
            id_asociado NUMBER GENERATED ALWAYS AS IDENTITY,
            nombre      VARCHAR2(50) NOT NULL,
            apellido    VARCHAR2(50) NOT NULL,
            CONSTRAINT pk_asociado PRIMARY KEY (id_asociado),
            CONSTRAINT uq_asociado UNIQUE (nombre, apellido)
        )
        `);
        await conn.commit();

        await conn.execute(`
        CREATE TABLE hospital_sede (
            id_hospital_sede     NUMBER GENERATED ALWAYS AS IDENTITY,
            direccion            VARCHAR2(100) NOT NULL,
            id_hospital 		NUMBER NOT NULL,
            CONSTRAINT pk_hospital_sede PRIMARY KEY (id_hospital_sede),
            CONSTRAINT fk_id_hospital_sh FOREIGN KEY (id_hospital) REFERENCES hospital (id_hospital),
            CONSTRAINT uq_hospital_sede UNIQUE (id_hospital_sede, direccion)
        )
        `);
        await conn.commit();

        await conn.execute(`
        CREATE TABLE ubicacion_victima (
            ubicacion_victima_id   	NUMBER GENERATED ALWAYS AS IDENTITY,
            fecha_llegada          	TIMESTAMP NOT NULL,
            fecha_retiro           	TIMESTAMP NOT NULL,
            id_victima     			NUMBER NOT NULL,
            id_ubicacion 			NUMBER NOT NULL,
            CONSTRAINT pk_ubicacion_victima PRIMARY KEY (ubicacion_victima_id),
            CONSTRAINT fk_victima_ub FOREIGN KEY (id_victima) REFERENCES victima (id_victima),
            CONSTRAINT fk_ubicacion_ub FOREIGN KEY (id_ubicacion) REFERENCES ubicacion (id_ubicacion)
        )
        `);
        await conn.commit();

        await conn.execute(`
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
        )
        `);
        await conn.commit();

        await conn.execute(`CREATE TABLE hospital_visita (
            id_victima             	NUMBER NOT NULL,
            id_hospital_sede 		NUMBER NOT NULL,
            CONSTRAINT pk_hospital_visita PRIMARY KEY (id_victima, id_hospital_sede),
            CONSTRAINT fk_victima_hv FOREIGN KEY (id_victima) REFERENCES victima (id_victima),
            CONSTRAINT fk_hospital_sede_hv FOREIGN KEY (id_hospital_sede) REFERENCES hospital_sede (id_hospital_sede)
        
        )
        `);
        await conn.commit();

        await conn.execute(`CREATE TABLE victima_asociado (
            fecha_conocio        	TIMESTAMP NOT NULL,
            id_victima   			NUMBER NOT NULL,
            id_asociado 			NUMBER NOT NULL,
            CONSTRAINT pk_victima_asociado PRIMARY KEY (id_victima, id_asociado),
            CONSTRAINT fk_victima_va FOREIGN KEY (id_victima) REFERENCES victima (id_victima),
            CONSTRAINT fk_asociado_va FOREIGN KEY (id_asociado) REFERENCES asociado (id_asociado)
        )
        `);
        await conn.commit();

        await conn.execute(`CREATE TABLE victima_asociado_contacto (
            id_contacto             NUMBER NOT NULL, 
            id_victima   			NUMBER NOT NULL, 
            id_asociado 			NUMBER NOT NULL,
            CONSTRAINT pk_victima_asociado_contacto PRIMARY KEY (id_contacto, id_victima, id_asociado),
            CONSTRAINT fk_contacto_vac FOREIGN KEY (id_contacto) REFERENCES contacto (id_contacto),
            CONSTRAINT fk_victima_vac FOREIGN KEY (id_victima) REFERENCES victima (id_victima),
            CONSTRAINT fk_asociado_vac FOREIGN KEY (id_asociado) REFERENCES asociado (id_asociado)
        )
        `);
        await conn.commit();

        await conn.execute(`INSERT INTO estado(descripcion) SELECT DISTINCT  ESTADO_VICTIMA FROM TEMP WHERE ESTADO_VICTIMA IS NOT NULL`);
        await conn.commit();

        await conn.execute(`INSERT INTO contacto(contacto_tipo, fecha_inicio_contacto,  fecha_fin_contacto) SELECT DISTINCT  CONTACTO_FISICO, 
TO_TIMESTAMP(FECHA_INICIO_CONTACTO, 'MM/DD/YYYY HH24:MI'), TO_TIMESTAMP(FECHA_FIN_CONTACTO, 'MM/DD/YYYY HH24:MI') FROM TEMP WHERE CONTACTO_FISICO IS NOT NULL
`);
        await conn.commit();

        await conn.execute(`INSERT INTO victima(nombre_victima, apellido_victima, direccion_victima, fecha_primera_sospecha, fecha_confirmacion, fecha_muerte, id_estado)
        SELECT DISTINCT  NOMBRE_VICTIMA, APELLIDO_VICTIMA, DIRECCION_VICTIMA, TO_TIMESTAMP(FECHA_PRIMERA_SOSPECHA, 'MM/DD/YYYY HH24:MI'), 
        TO_TIMESTAMP(FECHA_CONFIRMACION, 'MM/DD/YYYY HH24:MI'), TO_TIMESTAMP(FECHA_MUERTE, 'MM/DD/YYYY HH24:MI'),
        (SELECT id_estado FROM estado WHERE descripcion = TEMP.ESTADO_VICTIMA) AS id_estado FROM TEMP WHERE NOMBRE_VICTIMA IS NOT NULL AND APELLIDO_VICTIMA IS NOT NULL
        `);
        await conn.commit();

        await conn.execute(`INSERT INTO ubicacion(descripcion) SELECT DISTINCT UBICACION_VICTIMA FROM TEMP WHERE UBICACION_VICTIMA IS NOT NULL
        `);
        await conn.commit();


        await conn.execute(`INSERT INTO tratamiento(nombre, efectividad) SELECT DISTINCT TRATAMIENTO, EFECTIVIDAD FROM TEMP WHERE TRATAMIENTO IS NOT NULL
        `);
        await conn.commit();

        await conn.execute(`INSERT INTO hospital(nombre) SELECT DISTINCT NOMBRE_HOSPITAL FROM TEMP WHERE NOMBRE_HOSPITAL IS NOT NULL
        `);
        await conn.commit();


        await conn.execute(`INSERT INTO asociado(nombre, apellido) SELECT DISTINCT NOMBRE_ASOCIADO, APELLIDO_ASOCIADO FROM TEMP WHERE NOMBRE_ASOCIADO IS NOT NULL AND APELLIDO_ASOCIADO IS NOT NULL
        `);
        await conn.commit();

        await conn.execute(`INSERT INTO hospital_sede(direccion, id_hospital) SELECT DISTINCT DIRECCION_HOSPITAL,
        (SELECT id_hospital FROM hospital WHERE nombre = TEMP.NOMBRE_HOSPITAL) AS id_hospital 
        FROM TEMP WHERE DIRECCION_HOSPITAL IS NOT NULL`);
        await conn.commit();


        await conn.execute(`INSERT INTO hospital_visita (id_victima, id_hospital_sede)
        SELECT DISTINCT v.id_victima, hs.id_hospital_sede
        FROM victima v
        INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
        INNER JOIN hospital_sede hs ON hs.DIRECCION = t.DIRECCION_HOSPITAL AND hs.id_hospital = (SELECT id_hospital FROM hospital WHERE NOMBRE = t.NOMBRE_HOSPITAL)
        INNER JOIN hospital h ON h.id_hospital = hs.id_hospital
        WHERE t.DIRECCION_HOSPITAL IS NOT NULL AND t.NOMBRE_HOSPITAL IS NOT NULL
        `);
        await conn.commit();

        await conn.execute(`INSERT INTO ubicacion_victima (fecha_llegada, fecha_retiro, id_victima, id_ubicacion)
        SELECT DISTINCT  TO_TIMESTAMP(t.FECHA_LLEGADA, 'MM/DD/YYYY HH24:MI'), TO_TIMESTAMP(t.FECHA_RETIRO, 'MM/DD/YYYY HH24:MI'), v.id_victima, u.id_ubicacion
        FROM victima v
        INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
        INNER JOIN UBICACION u ON u.DESCRIPCION = t.UBICACION_VICTIMA WHERE t.UBICACION_VICTIMA IS NOT NULL
        `);
        await conn.commit();


        await conn.execute(`INSERT INTO tratamiento_victima(fecha_inicio_tratamiento, fecha_fin_tratamiento, efectividad_en_victima, id_victima, id_tratamiento)
        SELECT DISTINCT TO_TIMESTAMP(t.FECHA_INICIO_TRATAMIENTO, 'MM/DD/YYYY HH24:MI'), TO_TIMESTAMP(t.FECHA_FIN_TRATAMIENTO, 'MM/DD/YYYY HH24:MI'), 
        CASE WHEN REGEXP_LIKE(REGEXP_REPLACE(t.EFECTIVIDAD_EN_VICTIMA, '[^[:digit:]]', ''), '^[[:digit:]]+$')
        THEN CAST(REGEXP_REPLACE(t.EFECTIVIDAD_EN_VICTIMA, '[^[:digit:]]', '') AS NUMBER) ELSE NULL END,
        v.id_victima, tr.id_tratamiento
        FROM victima v
        INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
        INNER JOIN TRATAMIENTO tr ON tr.NOMBRE = t.TRATAMIENTO
        `);
        await conn.commit();

        await conn.execute(`INSERT INTO victima_asociado(fecha_conocio, id_victima, id_asociado)
        SELECT DISTINCT tn.fecha_conocio, tn.id_victima, tn.id_asociado
        FROM(
            SELECT DISTINCT v.id_victima, a.id_asociado,  MIN(TO_TIMESTAMP(t.FECHA_CONOCIO, 'MM/DD/YYYY HH24:MI')) AS fecha_conocio
            FROM victima v
            INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
            INNER JOIN asociado a ON a.NOMBRE  = t.NOMBRE_ASOCIADO  AND a.APELLIDO =  t.APELLIDO_ASOCIADO
              --WHERE v.id_victima IS NOT NULL AND a.id_asociado IS NOT NULL 
            GROUP BY v.id_victima, a.id_asociado
        ) tn
        `);
        await conn.commit();


        await conn.execute(`INSERT INTO victima_asociado_contacto(id_contacto, id_victima, id_asociado)
        SELECT DISTINCT tn.id_contacto, tn.id_victima, tn.id_asociado
        FROM(
            SELECT DISTINCT c.id_contacto, v.id_victima, a.id_asociado
            FROM victima v
            INNER JOIN TEMP t ON v.nombre_victima = t.NOMBRE_VICTIMA AND v.apellido_victima = t.APELLIDO_VICTIMA
            INNER JOIN asociado a ON a.NOMBRE  = t.NOMBRE_ASOCIADO  AND a.APELLIDO =  t.APELLIDO_ASOCIADO
            INNER JOIN CONTACTO c ON  c.CONTACTO_TIPO = t.CONTACTO_FISICO AND c.CONTACTO_TIPO = t.CONTACTO_FISICO 
            AND c.FECHA_INICIO_CONTACTO = TO_TIMESTAMP(t.FECHA_INICIO_CONTACTO, 'MM/DD/YYYY HH24:MI') 
            AND c.FECHA_FIN_CONTACTO = TO_TIMESTAMP(t.FECHA_FIN_CONTACTO, 'MM/DD/YYYY HH24:MI')
        ) tn
        `);
        await conn.commit();

        res.end('Tablas creadas');
        //res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    } finally {
        console.log('Closing connection')
        // Release the connection back to the pool
        if (conn) {
            await conn.close();
        }
    }
});

app.all('*', (req, res) => {
    res.status(404).send('<h1>Pagina no encontrada</h1>');
});








