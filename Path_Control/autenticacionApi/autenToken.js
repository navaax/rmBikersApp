app.get('/', async (req, res) => {
    try {
      const accessToken = 'TU_TOKEN_DE_ACCESO';
      const appId = 'TU_ID_DE_APLICACION';
  
      const url = `https://api.mercadolibre.com/applications/${appId}`;
  
      axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(async (response) => {
          const data = await response.json();
          const items = data.results;
  
          console.log('API response:', data);
          res.render('index', { items });
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          res.status(500).send('Error fetching data'); // Handle errors gracefully
        });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data'); // Handle errors gracefully
    }
  });