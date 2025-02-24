/**
 * Configuración del servidor Express para la API de gestión de tareas.
 *
 * Este módulo configura un servidor Express que maneja la autenticación de usuarios
 * y la gestión de tareas. Se utiliza `body-parser` para procesar solicitudes JSON,
 * `cors` para permitir solicitudes desde diferentes orígenes y se definen rutas para
 * autenticación y tareas.
 */

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import tasksRouter from './routes/tasks.js';
import authRouter from './routes/auth.js';

// Crear una instancia de la aplicación Express
const app = express();

// Middleware para habilitar CORS (permite solicitudes desde otros dominios)
app.use(cors());

// Middleware para procesar datos en formato JSON en las solicitudes
app.use(bodyParser.json());

// Rutas de la API
app.use('/tasks', tasksRouter); // Rutas para la gestión de tareas
app.use('/auth', authRouter); // Rutas para la autenticación de usuarios

/**
 * Inicia el servidor en el puerto 3000, a menos que esté en un entorno de pruebas.
 *
 * - Si `NODE_ENV` es diferente de `test`, el servidor inicia en el puerto 3000.
 * - Si `NODE_ENV` es `test`, la aplicación se exporta sin iniciar el servidor para permitir pruebas automatizadas.
 */
if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log(`Servidor escuchando en http://localhost:3000`);
  });
}

// Exportar la aplicación para que pueda ser utilizada en pruebas o en otros módulos
export default app;
