import mysql from 'mysql';



const connectionConfig = {
  host: "localhost",
  user: "root",
  password: "", // Replace with your password (if applicable)
  // database: "rmb_server"
};

async function connectToMySQL() {
  try {
    const connection = mysql.createConnection(connectionConfig);
    const trueConnect = await connection.connect();
    if(trueConnect == true){
      console.log('Conectado');
    }else{
      console.log('Problemas en la conexion');
    }

    // Perform database operations here using `connection`

    await connection.end(); // Close the connection when done
  } catch (err) {
    console.error("Error connecting to MySQL:", err);
    // Handle connection errors here (e.g., retry logic, logging)
  }
}

connectToMySQL(); // Call the function to initiate the connection