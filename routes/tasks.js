/**
 * Módulo de gestión de tareas.
 *
 * Este módulo implementa endpoints para que los usuarios autenticados puedan
 * leer, crear, actualizar y eliminar tareas. Se utiliza JWT para la autenticación,
 * UUID para generar identificadores únicos y un archivo JSON para almacenar las tareas.
 */

import express from "express";
import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { jwtSecret } from "../config.js";

// Definir las variables para obtener la ruta actual del módulo.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear el enrutador de Express y definir la ruta del archivo JSON que almacena las tareas.
const router = express.Router();
const tasksFilePath = path.join(__dirname, "../data/tasks.json");

/**
 * Middleware de autenticación JWT.
 *
 * Verifica el token enviado en el header 'Authorization'. Si el token es válido,
 * se asigna la información del usuario a `req.user` y se continúa a la siguiente función.
 * En caso contrario, se devuelve un error 401 (sin token) o 403 (token inválido).
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Acceso denegado");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error("Error al verificar el token:", err);
      return res.status(403).send("Token inválido");
    }
    req.user = user;
    next();
  });
};

/**
 * Obtener todas las tareas del usuario autenticado.
 *
 * Endpoint: GET /
 *
 * Lee el archivo de tareas, filtra las tareas que pertenecen al usuario autenticado
 * y responde con un JSON que contiene dichas tareas.
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const data = await fs.readFile(tasksFilePath, "utf8");
    const tasks = JSON.parse(data);
    const userTasks = tasks.filter(
      (task) => task.username === req.user.username
    );
    res.json(userTasks);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error en el servidor");
  }
});

/**
 * Crear una nueva tarea.
 *
 * Endpoint: POST /
 *
 * Crea una tarea nueva combinando los datos recibidos en el cuerpo de la petición
 * con un identificador único (UUID) y la asociación al usuario autenticado.
 * La tarea se añade al archivo de tareas y se responde con el objeto creado.
 */
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const newTask = {
      ...req.body,
      id: uuidv4(),
      username: req.user.username,
    };

    const data = await fs.readFile(tasksFilePath, "utf8");
    const tasks = JSON.parse(data);
    tasks.push(newTask);
    await fs.writeFile(tasksFilePath, JSON.stringify(tasks));
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error en el servidor");
  }
});

/**
 * Eliminar una tarea.
 *
 * Endpoint: DELETE /:id
 *
 * Elimina la tarea identificada por el parámetro `id` únicamente si pertenece
 * al usuario autenticado. Se actualiza el archivo de tareas y se responde confirmando
 * la eliminación.
 */
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const taskId = req.params.id;
    const data = await fs.readFile(tasksFilePath, "utf8");
    let tasks = JSON.parse(data);
    tasks = tasks.filter(
      (task) => !(task.id === taskId && task.username === req.user.username)
    );
    await fs.writeFile(tasksFilePath, JSON.stringify(tasks));
    res.status(200).send("Tarea eliminada");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error en el servidor");
  }
  // Nota: A continuación se declara una ruta PUT para actualizar tareas.
  // Se observa que esta declaración está anidada dentro de la ruta DELETE, lo que podría
  // generar comportamientos inesperados. Se mantiene la estructura original sin modificar el código.
  router.put("/:id", authenticateJWT, async (req, res) => {
    try {
      const taskId = req.params.id;
      const updatedTask = req.body;

      const data = await fs.readFile(tasksFilePath, "utf8");
      let tasks = JSON.parse(data);

      const taskIndex = tasks.findIndex(
        (task) => task.id === taskId && task.username === req.user.username
      );
      if (taskIndex === -1) {
        return res.status(404).send("Tarea no encontrada");
      }

      tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
      await fs.writeFile(tasksFilePath, JSON.stringify(tasks));

      res.status(200).json(tasks[taskIndex]);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error en el servidor");
    }
  });
});

/**
 * Obtener una tarea específica.
 *
 * Endpoint: GET /:id
 *
 * Busca y devuelve la tarea que coincide con el `id` proporcionado, siempre y cuando
 * pertenezca al usuario autenticado. Si la tarea no se encuentra, responde con error 404.
 */
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const taskId = req.params.id;
    const data = await fs.readFile(tasksFilePath, "utf8");
    const tasks = JSON.parse(data);

    const task = tasks.find(
      (task) => task.id === taskId && task.username === req.user.username
    );
    if (!task) {
      return res.status(404).send("Tarea no encontrada");
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error en el servidor");
  }
});

/**
 * Actualizar campos específicos de una tarea.
 *
 * Endpoint: PUT /:id
 *
 * Actualiza únicamente los campos `titulo` y `descripcion` de la tarea identificada
 * por el parámetro `id`, siempre que la tarea pertenezca al usuario autenticado.
 * Se actualiza el archivo de tareas y se responde con la tarea actualizada.
 */
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = req.body;

    const data = await fs.readFile(tasksFilePath, "utf8");
    let tasks = JSON.parse(data);

    const taskIndex = tasks.findIndex(
      (task) => task.id === taskId && task.username === req.user.username
    );
    if (taskIndex === -1) {
      return res.status(404).send("Tarea no encontrada");
    }

    // Actualizar solo los campos 'titulo' y 'descripcion'
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      titulo: updatedTask.titulo,
      descripcion: updatedTask.descripcion,
    };

    await fs.writeFile(tasksFilePath, JSON.stringify(tasks));

    res.status(200).json(tasks[taskIndex]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error en el servidor");
  }
});

export default router;
