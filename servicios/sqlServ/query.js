import connection from './connect.js'; 

async function getQueryDB(sqlQuery) {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, (err, results, fields) => {  // 'fields' es el tercer parámetro
            if (err) {
                console.error('Error al consultar:', err);
                return reject(err); // Rechaza la promesa en caso de error
            }
            
            resolve(results);  // Resuelve con los resultados
        });
    });
}

export default getQueryDB;
