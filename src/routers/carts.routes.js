import express from 'express';
import CartManager from '../models/CartsManager.js';

const cartsRouter = express.Router();
const cartManager = new CartManager('./src/carts.json');

export default function configureCartsRoutes(io) {
  cartsRouter.post('/', async (req, res) => {
    try {
      const newCart = await cartManager.createCart();
      res.status(201).json(newCart);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el carrito' });
    }
  });

  cartsRouter.get('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    try {
      const cart = await cartManager.getCartById(cartId);
      res.json(cart);
    } catch (error) {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  });

  cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
      const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
      io.emit('newProduct', updatedCart.products); // Emitir evento WebSocket al agregar producto
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
  });



  return cartsRouter;
}
