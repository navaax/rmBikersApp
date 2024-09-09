import xlsx from 'xlsx';


const filePath = './GlobalMLRMBikers.xlsx';
loadExcelGobalML(filepath);

function loadExcelGobalML(filePath){
    
    workbook = xlsx.readFile(filePath);

    const sheetname =   workbook.SheetsName['3'];
    const worksheet = workbook.Sheets[sheetname];


    const data = XLSX.utils.sheet_to_json(worksheet);
    const titulo = data.map(row=> row[Titulo]);
    
    
async function buscarProductosApi(producto, accessToken) {
    const siteId = 'MLM';
    const url = `https://api.mercadolibre.com/sites/${siteId}/search?q=${encodeURIComponent(
      producto.Titulo
    )}&attributes=id,price,category_id,title,seller,available_quantity&category_id=${
      producto.CategoriaID
    }&limit=50`;
    console.log(url);
  
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      return response.data.results; // Retorna la lista de resultados
    } catch (error) {
      console.error(`Error en la búsqueda de productos: ${error.message}`);
      throw error;
    }
  }
  
    return titulo;
}



