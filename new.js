
import getAuthFromMercadoApi from './control/Path_Control/autenticacionApi/Auth/autenToken.js';
// import getSellerData from './control/Path_Control/autenticacionApi/Auth/getSeller.js';

//https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=1529010052401438&redirect_uri=https://rm-bikers-report.vercel.app/

const clientSecret = 'SCSyojoPkGYi3LT5OYGbTXVJPZv775VM';
const appId = '889807737673414';
const redirectUri = 'https://localhost:3000';
const authorizationCode = 'TG-66dcb28acd88e30001c50928-420711769'; 

// const questionData = {
//   questionId: 123456, 
//   answerText: 'Agrdecemos el contacto, el articulo ${nombreArticulo} es de color ${colorArticulo}!', 
// };

async function main() {
  try {
    const redirectUrl = await getAuthFromMercadoApi(appId, clientSecret, redirectUri, authorizationCode);
    console.log(redirectUri);

    // Assuming getSellerData is asynchronous
    // const sellerData = await getSellerData();
    // console.log(sellerData); // Or use data as needed

    // Assuming getPreguntas is asynchronous
    // const preguntasData = await getItems();
    // console.log(preguntasData); // Access questions data here
  } catch (error) {
    console.error('Error:', error);
  }
}

main();