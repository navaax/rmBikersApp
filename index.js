
import getAuthFromMercadoApi from './Path_Control/autenticacionApi/Auth/autenToken.js';
import getSellerData from './Path_Control/autenticacionApi/articulos/preguntas/getSeller.js';
import getItems from './Path_Control/autenticacionApi/articulos/preguntas/getPreguntas.js';

//https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=1529010052401438&redirect_uri=https://localhost:8080

const clientSecret = 'wfxo5pOEUnab4Co0tyz9JMKQlZwPlVua';
const appId = '1529010052401438';
const redirectUri = 'https://localhost:8080';
const authorizationCode = 'TG-66d0a73fc975520001e44d1c-635799575'; 

const questionData = {
  questionId: 123456, 
  answerText: 'Agrdecemos el contacto, el articulo ${nombreArticulo} es de color ${colorArticulo}!', 
};

async function main() {
  try {
    const redirectUrl = await getAuthFromMercadoApi(appId, clientSecret, redirectUri, authorizationCode);
    console.log(redirectUri);

    // Assuming getSellerData is asynchronous
    const sellerData = await getSellerData();
    console.log(sellerData); // Or use data as needed

    // Assuming getPreguntas is asynchronous
    // const preguntasData = await getItems();
    // console.log(preguntasData); // Access questions data here
  } catch (error) {
    console.error('Error:', error);
  }
}

main();