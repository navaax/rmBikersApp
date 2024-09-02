import fs from 'fs/promises';

// Función para guardar los datos en un archivo TXT
async function saveFirstDataTokken(dataUserToken, txtFile) {
  try {
    // Asegúrate de que txtFile y dataUserToken no sean undefined
    if (!txtFile) {
      throw new Error('La ruta del archivo no puede ser undefined');
    }
    if (!dataUserToken) {
      throw new Error('Los datos del token no pueden ser undefined');
    }

    // Convertir el objeto JSON a una cadena (se puede personalizar el formato)
    const textData = JSON.stringify(dataUserToken, null, 2); // Indentaciones para mejor legibilidad

    // Escribir los datos en el archivo especificado
    await fs.writeFile(txtFile, textData, 'utf8');
    console.log('Datos guardados correctamente en TXT');
  } catch (error) {
    console.error('Error al escribir el archivo TXT:', error);
    throw error;
  }
}

export default saveFirstDataTokken;
