# gestorTareasBack


Este proyecto es una aplicación de gestión de tareas desarrollada utilizando Angular en el frontend y Express en el backend. La aplicación permite a los usuarios autenticarse y gestionar sus tareas (crear, leer, actualizar y eliminar) mediante una API protegida con JWT. El almacenamiento se realiza mediante archivos JSON locales.
Instrucciones de instalación:

 

Repositorios Backend: https://github.com/lvalentinah/gestorTareasBack.git 

Frontend: https://github.com/lvalentinah/GestorTareasFront.git 

 

Características

Autenticación: Registro e inicio de sesión de usuarios con JWT. CRUD de Tareas: Crear, listar, actualizar y eliminar tareas.
Validaciones y Seguridad: Validación de datos y manejo seguro de contraseñas mediante bcrypt.
Pruebas Unitarias: Implementación de pruebas en el frontend (Jasmine) y backend (Mocha/Chai).
Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalados:

Node.js (versión 12 o superior) NPM (incluido con Node.js)
Angular CLI para trabajar con el frontend y express.
Instalación

Clona el repositorio del backend:
git clone https://github.com/lvalentinah/gestorTareasBack.git 

Clona el repositorio del frontend en otro directorio:
git clone https://github.com/lvalentinah/GestorTareasFront.git 

Configuración del Backend

Accede a la carpeta del backend:
cd gestorTareasBack

Instala las dependencias:

npm install

Crea un archivo de configuración llamado config.js en la raíz del backend con la siguiente estructura (ajusta el valor de jwtSecret según tus preferencias):

export const jwtSecret = 'tu_clave_secreta';

Nota: Asegúrate de que la carpeta data contenga los archivos users.json y tasks.json. Si no existen, crea archivos vacíos con el siguiente contenido:

users.json: [] tasks.json: []

Configuración del Frontend Abre una terminal nueva y accede a la carpeta del frontend:
cd GestorTareasFront

Instala las dependencias:

Como el proyecto contiene componentes se la librería corporativa sherpa se debe autenticar en jfrog

npm config set registry https://bbogdigital.jfrog.io/bbogdigital/api/npm/npm-bbta/

npm login --registry=https://bbogdigital.jfrog.io/bbogdigital/api/npm/npm-bbta/

npm install --force

Ejecución del Proyecto

Iniciar el Backend Desde la carpeta gestorTareasBack, ejecuta: node app.js
 El servidor Express se iniciará en http://localhost:3000.

Iniciar el Frontend Desde la carpeta GestorTareasFront, ejecuta:
ng serve

La aplicación Angular se levantará en http://localhost:4200.

Pruebas Unitarias Backend

Desde la carpeta gestorTareasBack, ejecuta:
npx cross-env NODE_ENV=test mocha test/**/*.mjs --exit

Esto ejecutará las pruebas unitarias con Mocha/Chai.

Frontend

Desde la carpeta GestorTareasFront, ejecuta:
ng test

Esto iniciará el entorno de pruebas unitarias con Jasmine/Karma.

Accede a http://localhost:4200 en tu navegador. Inicia sesión (usuario: user contraseña: user)
Gestiona tus tareas:

Listar Tareas: Visualiza las tareas asignadas al usuario autenticado.
Crear/Editar Tarea: Accede al formulario de tarea; el botón de envío se habilita una vez completados todos los campos.
Eliminar Tarea: Al seleccionar eliminar, se muestra una alerta de confirmación para evitar borrados accidentales.

