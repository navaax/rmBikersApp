import axios from 'axios';
import fs from 'fs';
import XLSX from 'xlsx';

// Función para leer el access_token desde un archivo
async function obtenerAccessToken() {
    // Implementa la lógica para obtener el access token
}

// Función para leer el primer título de un archivo Excel
function leerPrimerTitulo(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Lee la primera hoja
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log('Datos leídos del Excel:', data); // Depura los datos leídos

        if (data.length > 0) {
            // Asegúrate de que 'Titulo' es el nombre correcto de la columna
            const primerTitulo = data[0].Titulo; 
            if (primerTitulo) {
                return primerTitulo;
            } else {
                throw new Error('El valor de la columna "Titulo" está vacío.');
            }
        } else {
            throw new Error('No hay datos en el archivo Excel.');
        }
    } catch (error) {
        console.error(`Error al leer el archivo Excel: ${error.message}`);
        throw error;
    }
}

async function buscarProductosApi(primerTitulo, sellerIds, accessToken) {
    const siteId = 'MLM';
    const url = `https://api.mercadolibre.com/sites/${siteId}/search`;

    const params = {
        q: primerTitulo, // Título de búsqueda
        limit: 10 // Limitar a los primeros 10 resultados
    };

    try {
        const response = await axios.request({
            method: 'get',
            url: url,
            params: params, // Incluye los parámetros aquí
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const resultados = response.data.results;

        if (resultados.length === 0) {
            console.log('No se encontraron productos.');
        } else {
            const productosFiltrados = resultados.filter(producto => {
                // Lógica de filtrado (ajustar según tus necesidades)
                return sellerIds.includes(producto.seller.id); // Ejemplo de filtro por sellerId
            });

            obtenerDatos(productosFiltrados);
            return productosFiltrados;
        }
    } catch (error) {
        console.error(`Error en la búsqueda de productos: ${error.message}`);
        throw error;
    }
}

// Función principal
async function obtenerDatos() {
    try {
        const accessToken = await obtenerAccessToken();
        const primerTitulo = leerPrimerTitulo('/workspaces/rmBikersApp/Path_Control/autenticacionApi/metadata/replicaPublicaciones.xlsx');
        const sellerIds = [1107927983, 1111427732, 147712068, 1295123986, 132947885];

        console.log('Título a buscar:', primerTitulo); // Depura título a buscar

        const productosFiltrados = await buscarProductosApi(primerTitulo, sellerIds, accessToken);

        // Procesar los resultados filtrados (por ejemplo, guardar en un archivo CSV)
        console.log('Productos Filtrados:', productosFiltrados);

        // Crear un archivo CSV con los resultados
        const csvHeader = 'id,titulo,precio,vendedor\n';
        const csvData = productosFiltrados.map(producto => ({
            id: producto.id,
            titulo: producto.title,
            precio: producto.price,
            vendedor: producto.seller ? producto.seller.nickname : 'Desconocido'
        }));
        const csvRows = csvData.map(row => Object.values(row).join(',')).join('\n');
        const csv = csvHeader + csvRows;
        fs.writeFileSync('resultados.csv', csv);
    } catch (error) {
        console.error(`Error al obtener datos: ${error.message}`);
    }
}

obtenerDatos();
