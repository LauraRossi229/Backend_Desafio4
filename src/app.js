import express from 'express';
import { createServer } from 'http';
import exphbs from 'express-handlebars';
import path from 'path';
import { Server } from 'socket.io'; // Importa la clase Server
import productsRouter from './routers/products.routes.js';
import cartsRouter from './routers/carts.routes.js';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ProductManager from './models/ProductManager.js';

const productManager = new ProductManager('./src/products.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer); // Crea una instancia de Server

const port = process.env.PORT || 8080;

const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use(express.static(path.join(__dirname, 'public')));

const prods = []; // Define una variable para almacenar los productos

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });

  socket.on('newProduct', async (newProduct) => {
    // Agrega el nuevo producto a la variable "prods"
    prods.push(newProduct);
    io.emit('prods', prods); // Emite la lista actualizada de productos a todos los clientes
    
    await productManager.addProduct(newProduct); // Asegúrate de que esta línea esté presente
  });
  socket.on('deleteProduct', async (productId) => {
    try {
      const deletedProductId = await productManager.deleteProduct(productId);
      if (deletedProductId) {
        io.emit('productDeleted', deletedProductId);
      } else {
        console.log('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  });


});


app.get('/', async (req, res) => {
  try {
    const productsData = await fs.readFile(path.join(__dirname, 'products.json'), 'utf8');
    const products = JSON.parse(productsData);
    res.render('index', { products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error reading product data' });
  }
});

app.get('/realtimeproducts', async (req, res) => {
  try {
    const productsData = await fs.readFile(path.join(__dirname, 'products.json'), 'utf8');
    const products = JSON.parse(productsData);
    res.render('realTimeProducts', { products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error reading product data' });
  }
});

httpServer.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
