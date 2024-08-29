const fs = require('fs');
const json2csv = require('json2csv');

// Función para convertir JSON a CSV
function jsonToCsv(jsonFile, csvFile) {
  fs.readFile(jsonFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }

    try {
      // Parsear el JSON
      const jsonData = JSON.parse(data);

      // Convertir a CSV
      const csv = json2csv.parse(jsonData);

      // Escribir en el archivo CSV
      fs.writeFile(csvFile, csv, (err) => {
        if (err) {
          console.error('Error al escribir el archivo CSV:', err);
        } else {
          console.log('Conversión exitosa!');
        }
      });
    } catch (error) {
      console.error('Error al parsear el JSON:', error);
    }
  });
}

// Ejemplo de uso
const jsonFile = '../../../datos.txt'; // Reemplaza con la ruta de tu archivo JSON
const csvFile = 'output.csv';
jsonToCsv(jsonFile, csvFile);