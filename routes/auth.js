/**
 * Módulo de autenticación de usuarios.
 *
 * Este módulo utiliza Express para manejar rutas de registro e inicio de sesión.
 * Se emplea bcrypt para el cifrado de contraseñas y JSON Web Tokens (JWT) para la autenticación.
 * Los datos de los usuarios se almacenan en un archivo JSON en el sistema de archivos.
 */

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { jwtSecret } from "../config.js";

// Determinar la ruta del archivo actual y su directorio para manejo de rutas relativas.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear un enrutador de Express para definir los endpoints de autenticación.
const router = express.Router();

// Definir la ruta al archivo JSON que almacena los usuarios.
const usersFilePath = path.join(__dirname, "../data/users.json");

/**
 * Registro de usuario.
 *
 * Endpoint: POST /register
 *
 * Recibe en el cuerpo de la petición:
 *   - username: nombre de usuario.
 *   - password: contraseña en texto plano.
 *
 * Procedimiento:
 *   1. Lee el archivo de usuarios y lo parsea a JSON.
 *   2. Hashea la contraseña utilizando bcrypt con 8 rondas de sal.
 *   3. Agrega el nuevo usuario (con contraseña hasheada) al array de usuarios.
 *   4. Escribe el array actualizado en el archivo de usuarios.
 *
 * Respuestas:
 *   - 201: "Usuario registrado" al completar el registro.
 *   - 500: "Error en el servidor" en caso de ocurrir un error.
 */
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const data = await fs.readFile(usersFilePath, "utf8");
    let users = JSON.parse(data);
    const hashedPassword = await bcrypt.hash(password, 8);
    users.push({ username, password: hashedPassword });
    await fs.writeFile(usersFilePath, JSON.stringify(users));
    res.status(201).send("Usuario registrado");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error en el servidor");
  }
});

/**
 * Inicio de sesión.
 *
 * Endpoint: POST /login
 *
 * Recibe en el cuerpo de la petición:
 *   - username: nombre de usuario.
 *   - password: contraseña en texto plano.
 *
 * Procedimiento:
 *   1. Lee el archivo de usuarios y parsea su contenido.
 *   2. Busca el usuario que coincide con el username proporcionado.
 *   3. Verifica la contraseña comparando el valor recibido con el hasheado almacenado.
 *   4. Si la autenticación es correcta, genera un token JWT con una vigencia de 1 hora.
 *
 * Respuestas:
 *   - JSON con el token JWT si la autenticación es exitosa.
 *   - 401: "Credenciales inválidas" si el usuario no existe o la contraseña no coincide.
 *   - 500: "Error en el servidor" en caso de error.
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const data = await fs.readFile(usersFilePath, "utf8");
    const users = JSON.parse(data);
    const user = users.find((u) => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Credenciales inválidas");
    }

    const token = jwt.sign({ username: user.username }, jwtSecret, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error en el servidor");
  }
});

export default router;
