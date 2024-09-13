import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/index.js'; // Ruta correcta al enrutador

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configura EJS como el motor de plantillas
app.set('views', path.join(__dirname, 'vista')); // Asegúrate de que esta ruta sea correcta
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', indexRouter);

// Inicia el servidor
const port = 3035;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
