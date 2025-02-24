/**
 * Pruebas para la API de gestión de tareas con autenticación JWT.
 *
 * Se utiliza Chai y Chai-HTTP para realizar pruebas de integración sobre la API de tareas.
 * Se prueban los endpoints para obtener, crear, actualizar y eliminar tareas.
 * Se genera un token de autenticación para simular usuarios autenticados.
 */

import { use, expect } from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../app.js';

// Configuración de Chai para pruebas HTTP
const chai = use(chaiHttp);

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo de tareas donde se almacenan las tareas en formato JSON
const tasksFilePath = path.join(__dirname, '../data/tasks.json');

// Generar un token de prueba válido con una clave secreta simulada
const testToken = jwt.sign({ username: 'usuario', role: 'admin' }, 'clave_secreta');

describe('Tasks API', function () {
  let server;

  /**
   * Antes de ejecutar las pruebas, inicia el servidor en un puerto distinto (3001)
   * para evitar conflictos con el entorno de producción.
   */
  before(function () {
    server = app.listen(3001);
  });

  /**
   * Al finalizar todas las pruebas, se cierra el servidor.
   */
  after(function () {
    server.close();
  });

  /**
   * Antes de cada prueba, se reinicia el archivo de tareas con un array vacío.
   * Esto garantiza que cada prueba se ejecute en un entorno limpio.
   */
  beforeEach(async () => {
    try {
      await fs.writeFile(tasksFilePath, JSON.stringify([]));
    } catch (error) {
      console.error('Error en beforeEach:', error);
    }
  });

  /**
   * Prueba: Obtener todas las tareas.
   *
   * - Se espera que la API devuelva un array vacío cuando no hay tareas almacenadas.
   * - Se incluye el token de autenticación en la solicitud.
   */
  it('Obtener todas las tareas', async () => {
    const res = await chai.request(server)
      .get('/tasks')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(0);
  });

  /**
   * Prueba: Crear una nueva tarea.
   *
   * - Se envía una solicitud POST con una nueva tarea.
   * - Se espera que la API devuelva un código de estado 201 (creado).
   * - Luego, se hace una solicitud GET para verificar que la tarea fue almacenada correctamente.
   */
  it('Crear una nueva tarea', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'Test Description'
    };

    const postRes = await chai.request(server)
      .post('/tasks')
      .set('Authorization', `Bearer ${testToken}`)
      .send(newTask);

    expect(postRes).to.have.status(201);

    const getRes = await chai.request(server)
      .get('/tasks')
      .set('Authorization', `Bearer ${testToken}`);

    expect(getRes).to.have.status(200);
    expect(getRes.body).to.be.an('array');
    expect(getRes.body).to.have.lengthOf(1);
    expect(getRes.body[0]).to.include(newTask);
  });

  /**
   * Prueba: Eliminar una tarea existente.
   *
   * - Se almacena previamente una tarea en el archivo JSON.
   * - Se envía una solicitud DELETE con el ID de la tarea.
   * - Se espera que la API devuelva un código de estado 200.
   * - Luego, se hace una solicitud GET para verificar que la tarea ha sido eliminada.
   */
  it('Eliminar una tarea', async () => {
    const taskToDelete = {
      id: '1',
      title: 'Task to Delete',
      description: 'This task will be deleted'
    };

    // Pre-cargar el archivo de tareas con la tarea a eliminar
    await fs.writeFile(tasksFilePath, JSON.stringify([taskToDelete]));

    const deleteRes = await chai.request(server)
      .delete(`/tasks/${taskToDelete.id}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(deleteRes).to.have.status(200);

    const getRes = await chai.request(server)
      .get('/tasks')
      .set('Authorization', `Bearer ${testToken}`);

    expect(getRes).to.have.status(200);
    expect(getRes.body).to.be.an('array');
    expect(getRes.body).to.have.lengthOf(0);
  });

  /**
   * Prueba: Intentar eliminar una tarea que no existe.
   *
   * - Se envía una solicitud DELETE con un ID inexistente.
   * - Se espera que la API devuelva un código de estado 200, sin errores inesperados.
   */
  it('Eliminar una tarea que no existe', async () => {
    const deleteRes = await chai.request(server)
      .delete('/tasks/nonexistent-id')
      .set('Authorization', `Bearer ${testToken}`);

    expect(deleteRes).to.have.status(200);
  });

  /**
   * Prueba: Actualizar una tarea existente.
   *
   * - Se almacena previamente una tarea en el archivo JSON.
   * - Se envía una solicitud PUT con los nuevos datos de la tarea.
   * - Se espera que la API devuelva un código de estado 200.
   * - Luego, se hace una solicitud GET para verificar que la tarea se actualizó correctamente.
   */
  it('Actualizar una tarea', async () => {
    const taskToUpdate = {
      id: '1',
      title: 'Updated Task',
      description: 'Updated Description',
      username: 'usuario'
    };

    // Pre-cargar el archivo de tareas con la tarea a actualizar
    await fs.writeFile(tasksFilePath, JSON.stringify([taskToUpdate]));

    const updatedTask = {
      title: 'Updated Task',
      description: 'Updated Description'
    };

    const putRes = await chai.request(server)
      .put(`/tasks/${taskToUpdate.id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(updatedTask);

    expect(putRes).to.have.status(200);
    expect(putRes.body).to.include(updatedTask);

    const getRes = await chai.request(server)
      .get('/tasks')
      .set('Authorization', `Bearer ${testToken}`);

    expect(getRes).to.have.status(200);
    expect(getRes.body).to.be.an('array');
    expect(getRes.body).to.have.lengthOf(1);
    expect(getRes.body[0]).to.include(updatedTask);
  });
});
