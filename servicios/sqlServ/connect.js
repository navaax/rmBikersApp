import  mysql2 from 'mysql2';

const connection = mysql2.createConnection({
  host: 'localhost',
  user: 'RMB_NAVA',
  password: 'RMBIKERS-NAVAX24',
  database: 'rmbikers_2019'
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar:', err);
    return;
  }
  console.log('Conexión exitosa');
});


export default connection;
