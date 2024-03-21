const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');

const Product = require('./Product'); 
const Users = require('./users');

const app = express();
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Para parsear cuerpos de solicitud JSON
const PORT = 3000;


console.log(process.env.JWT_SECRET);






const uri = 'mongodb://drenvio:moM5f3AodwLE5d0A@ac-aemgtkt-shard-00-00.unqyghm.mongodb.net:27017,ac-aemgtkt-shard-00-01.unqyghm.mongodb.net:27017,ac-aemgtkt-shard-00-02.unqyghm.mongodb.net:27017/ChallengeDavid?replicaSet=atlas-y8oxsk-shard-0&ssl=true&authSource=admin';


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch(err => console.error('Error de conexión a la base de datos:', err));

// api productos

//Traer productos en stock
app.get('/productos', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true });
    res.json(products);  
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Crear productos
app.use(express.json());
app.post('/productos', async (req, res) => {
  const { name, price, inStock, brand, imageUrl } = req.body;
  const newProduct = new Product({
    name,
    price,
    inStock,
    brand,
    imageUrl 
  });

  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Usuarios

//Traer usuarios
app.get('/users', async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);  
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Crear usuarios
app.use(express.json()); 

app.post('/users', async (req, res) => {
  // Extrae los datos del usuario del cuerpo de la solicitud
  const { correo, nombres, apellidos, password, newletter } = req.body;

  // Encripta la contraseña
  // Genera un hash de la contraseña utilizando la librería crypto
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  let descuento = 0;
  if (newletter) {
    descuento = 10; 
  }

  // Crea una instancia del modelo Users con los datos recibidos
  const user = new Users({
    correo,
    nombres,
    apellidos,
    password: hashedPassword,
    newletter,
    descuento
  });

  try {
    // Guarda el usuario en la base de datos
    const newUser = await user.save();
    // Envía el usuario creado como respuesta
    res.status(201).json(newUser);
  } catch (err) {
    // En caso de error, envía un mensaje de error
    res.status(400).json({ message: err.message });
  }
});
// iniciar sesión
app.post('/login', async (req, res) => {
  try {
    // Buscar el usuario por correo
    const user = await Users.findOne({ correo: req.body.correo });
    if (user) {
      // Genera un hash de la contraseña proporcionada en la solicitud
      const hashedPassword = crypto.createHash('sha256').update(req.body.password).digest('hex');
      // Comprueba si el hash de la contraseña coincide con el almacenado en la base de datos
      if (hashedPassword === user.password) {
        // Generar un token
        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET, 
          { expiresIn: '1h' }
        );

        // Envía el token, el ID del usuario y un mensaje de éxito
        res.status(200).json({
          token: token,
          user: { // Envía la información del usuario
            id: user._id,
            name: user.nombres,
          } 
        });
      } else {
        res.status(400).json({
          error: "Contraseña incorrecta",
          passwordAttempted: req.body.password,
          storedPassword: user.password
        });
      }
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extrae el token de la cabecera de autorización

  if (!token) {
    return res.status(403).send("Se requiere un token para autenticación");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Token inválido o expirado");
  }

  next();
};

app.get('/price/:user_id/:nombre_producto', async (req, res) => {
  try {
    const { user_id, nombre_producto } = req.params;

    // Convertir user_id a ObjectId acá tuve problemas
    const user = await Users.findById(user_id);

    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Buscar el producto por su nombre
    const product = await Product.findOne({ name: nombre_producto });
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Calcular el precio base del producto
    let precio = (product.price *10)/100;
    let precioFinal = product.price - precio;

    
   

    // Aplicar el descuento específico del producto si existe
    if (product.descuento) {
      precioFinal -= (precioFinal * 10) / 100;
    }

    // Devolver el precio final al cliente
    res.json({ precioFinal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
