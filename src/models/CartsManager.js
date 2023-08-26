import { promises as fs } from 'fs';



class CartManager {
  constructor(path) {
    this.path = path;
  }

  async readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  }

  async writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2), 'utf8');
  }

  async createCart() {
    const carts = await this.readFile();
    const maxId = carts.reduce((max, cart) => (parseInt(cart.id) > max ? parseInt(cart.id) : max), 0);
    const newCart = { id: (maxId + 1).toString(), products: [] };
    carts.push(newCart);
    await this.writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.readFile();
    const cart = carts.find((c) => c.id === id);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }
    return cart;
  }

  async addProductToCart(cartId, productId, quantity) {
    const carts = await this.readFile();
    const cartIndex = carts.findIndex((c) => c.id === cartId);
  
    if (cartIndex === -1) {
      throw new Error('Carrito no encontrado');
    }
  
    const product = { id: parseInt(productId), quantity };
    const existingProductIndex = carts[cartIndex].products.findIndex((p) => p.id === parseInt(productId));

    if (existingProductIndex === -1) {
      carts[cartIndex].products.push(product);
    } else {
      carts[cartIndex].products[existingProductIndex].quantity += quantity;
    }

    await this.writeFile(carts);
    return carts[cartIndex];
  }
}

export default CartManager;

