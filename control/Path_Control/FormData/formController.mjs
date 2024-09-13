import getQueryDB from '../../../servicios/sqlServ/query.js';

export const getColumns = async (req, res, next) => {
    try {
        const query = 'DESC producto'; // Consulta para obtener la descripción de la tabla 'producto'
        const columns = await getQueryDB(query);

        // Guarda los datos en `res.locals` para usarlos en la vista
        res.locals.columns = columns;
        next(); // Llama al siguiente middleware
    } catch (err) {
        console.error('Error al obtener columnas:', err);
        res.status(500).send('Error al obtener columnas');
    }
};

export default getColumns;
