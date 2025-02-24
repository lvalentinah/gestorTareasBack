/**
 * Módulo de gestión de tareas.
 *
 * Este módulo maneja la lectura, creación y eliminación de tareas utilizando
 * archivos JSON como almacenamiento. Se implementa con Express y utiliza el
 * sistema de archivos (`fs`) para leer y escribir tareas.
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Definir la ruta del archivo donde se almacenan las tareas
const tasksFilePath = path.join(__dirname, '../../data/tasks.json');

/**
 * Obtener todas las tareas.
 *
 * Endpoint: GET /
 *
 * Lee el archivo JSON de tareas y responde con un JSON que contiene todas las tareas almacenadas.
 * Si hay un error al leer el archivo, se devuelve un error 500.
 */
router.get('/', (req, res) => {
  fs.readFile(tasksFilePath, (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer las tareas');
    }
    const tasks = JSON.parse(data.toString());
    res.json(tasks);
  });
});

/**
 * Crear una nueva tarea.
 *
 * Endpoint: POST /
 *
 * Recibe en el cuerpo de la petición una nueva tarea y la agrega al archivo JSON.
 * Si hay un error al leer o escribir el archivo, se devuelve un error 500.
 */
router.post('/', (req, res) => {
  const newTask = req.body;

  fs.readFile(tasksFilePath, (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer las tareas');
    }

    const tasks = JSON.parse(data.toString());
    tasks.push(newTask);

    fs.writeFile(tasksFilePath, JSON.stringify(tasks), (err) => {
      if (err) {
        return res.status(500).send('Error al guardar la tarea');
      }
      res.status(201).send('Tarea creada');
    });
  });
});

/**
 * Eliminar una tarea.
 *
 * Endpoint: DELETE /:id
 *
 * Busca la tarea por su ID en el archivo JSON y la elimina si existe.
 * Si hay un error al leer o escribir el archivo, se devuelve un error 500.
 */
router.delete('/:id', (req, res) => {
  const taskId = req.params.id;

  fs.readFile(tasksFilePath, (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer las tareas');
    }

    let tasks = JSON.parse(data.toString());

    // Filtrar la lista de tareas eliminando la que coincida con el ID proporcionado
    tasks = tasks.filter(task => task.id !== taskId);

    fs.writeFile(tasksFilePath, JSON.stringify(tasks), (err) => {
      if (err) {
        return res.status(500).send('Error al eliminar la tarea');
      }
      res.send('Tarea eliminada');
    });
  });
});

export default router;
