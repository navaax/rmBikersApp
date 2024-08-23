const getApiMercado = async () => {
    try {
      const apiConnect = await fetch('https://api.mercadolibre.com/sites/1734627825436698/listing_types', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer $qrmwxqaNcc9EJ33PITfRszG9KsgGBrnD'
        }
      });
      const apiResponse = await apiConnect.json();

      console.log(apiResponse);
    } catch (error) {
      console.error('Error fetching data from Mercado Libre API:', error);
      // Handle the error here (e.g., display an error message)
    }
  };