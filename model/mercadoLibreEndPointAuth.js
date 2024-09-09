import axios from 'axios';
import  qs from 'qs';

//Module Auth
import refreshTokenData from './control/Path_Control/autenticacionApi/Auth/refreshToken.js';
//End of Module Auth


async function refreshAuthML(dataToken){
    let data = qs.stringify({
        'grant_type': 'refresh_token',
        'client_id': dataToken.APP_ID,
        'client_secret': dataToken.SECRET_KEY,
        'refresh_token': dataToken.REFRESH_TOKEN
      });
      const url = dataToken.URL;
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: { 
          'accept': 'application/json', 
          'content-type': 'application/x-www-form-urlencoded'
        },
        data : data
      };
      
      axios.request(config)
      .then((response) => {
        try {
            saveDataResponse = response.data;
            saveNewDataToken(saveDataResponse);
        
        } catch (error) {
            throw ('Refresh Token Save Data error:', error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
      
}