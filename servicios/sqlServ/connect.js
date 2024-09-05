import  mysql from 'mysql';

const connection = mysql.createConnection({
  host: '192.168',
  port: 3306,
  user: 'remote',
  password: '1234',
  database: 'tablas'
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar:', err);
    return;
  }
  console.log('Conexión exitosa');
});
