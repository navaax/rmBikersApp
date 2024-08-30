import ExcelJS from 'exceljs';
import fs from 'fs';
import { stringify } from 'csv-stringify/sync';

// Función para convertir datos a un archivo XLSX
async function convertToXlsx(data, filePath) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Artículos');

  // Definir las columnas
  worksheet.columns = [
    { header: 'ID Mercado', key: 'idMercado', width: 20 },
    { header: 'Nombre', key: 'Nombre', width: 30 },
    { header: 'ID Producto', key: 'Id_Producto', width: 20 },
    { header: 'Precio', key: 'Precio', width: 15 },
    { header: 'Base Precio', key: 'BasePrecio', width: 15 },
    { header: 'Precio Original', key: 'OriginalPrice', width: 15 },
    { header: 'Stock', key: 'Stock', width: 15 }
  ];

  // Agregar filas de datos
  data.forEach(item => {
    worksheet.addRow({
      idMercado: item.Datos.idMercado,
      Nombre: item.Datos.Nombre,
      Id_Producto: item.Datos.Id_Producto,
      Precio: item.Datos.Precio,
      BasePrecio: item.Datos.BasePrecio,
      OriginalPrice: item.Datos.OriginalPrice,
      Stock: item.Stock
    });
  });

  // Guardar el archivo Excel
  await workbook.xlsx.writeFile(filePath);
  console.log(`Datos escritos en ${filePath}`);
}

// Función para convertir datos a un archivo CSV
function convertToCsv(data, filePath) {
  const records = data.map(item => [
    item.Datos.idMercado,
    item.Datos.Nombre,
    item.Datos.Id_Producto,
    item.Datos.Precio,
    item.Datos.BasePrecio,
    item.Datos.OriginalPrice,
    item.Stock
  ]);

  // Agregar cabeceras
  const header = ['ID Mercado', 'Nombre', 'ID Producto', 'Precio', 'Base Precio', 'Precio Original', 'Stock'];
  records.unshift(header);

  // Convertir a CSV
  const csv = stringify(records, { header: false });
  fs.writeFileSync(filePath, csv);
  console.log(`Datos escritos en ${filePath}`);
}

// Exportar funciones
export { convertToXlsx, convertToCsv };
