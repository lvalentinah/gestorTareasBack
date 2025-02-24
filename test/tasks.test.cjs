/**
 * Pruebas para la API de gestión de tareas.
 *
 * Se utiliza Chai y Chai-HTTP para realizar pruebas de integración sobre la API de tareas.
 * Se prueban los endpoints para obtener, crear y eliminar tareas.
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const { expect } = chai;

const fs = require('fs').promises;
const path = require('path');
const app = require('../app.js');

const tasksFilePath = path.join(__dirname, '../data/tasks.json');

describe('Tasks API', function() {
  let server;
  
  /**
   * Antes de ejecutar las pruebas, se inicia el servidor en el puerto 3001.
   * Se usa un puerto distinto al de producción para evitar conflictos.
   */
  before(function() {
    server = app.listen(3001);
  });

  /**
   * Una vez finalizadas todas las pruebas, se cierra el servidor.
   */
  after(function() {
    server.close();
  });

  /**
   * Antes de cada prueba, se reinicia el archivo de tareas con un array vacío.
   * Esto garantiza que cada prueba se ejecuta en un entorno limpio.
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
   * - Verifica que la respuesta tenga un código de estado 200.
   */
  it('debería obtener todas las tareas', async () => {
    const res = await chai.request(server).get('/tasks');
    
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
  it('debería crear una nueva tarea', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'Test Description'
    };

    const postRes = await chai.request(server)
      .post('/tasks')
      .send(newTask);

    expect(postRes).to.have.status(201);

    const getRes = await chai.request(server).get('/tasks');

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
  it('debería eliminar una tarea', async () => {
    const taskToDelete = {
      id: '1',
      title: 'Task to Delete',
      description: 'This task will be deleted'
    };

    await fs.writeFile(tasksFilePath, JSON.stringify([taskToDelete]));

    const deleteRes = await chai.request(server).delete(`/tasks/${taskToDelete.id}`);

    expect(deleteRes).to.have.status(200);

    const getRes = await chai.request(server).get('/tasks');

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
  it('debería manejar el intento de eliminar una tarea que no existe', async () => {
    const deleteRes = await chai.request(server).delete('/tasks/nonexistent-id');

    expect(deleteRes).to.have.status(200);
  });
});
