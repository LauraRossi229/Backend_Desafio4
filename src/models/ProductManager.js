import { promises as fs } from 'fs';

class ProductManager {
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

  async addProduct(product) {
    const products = await this.readFile();
    const maxId = products.reduce((max, p) => (parseInt(p.id) > max ? parseInt(p.id) : max), 0);
    const newProduct = { ...product, id: maxId + 1 };
    products.push(newProduct);
    await this.writeFile(products);
    return newProduct;
  }

  async getProducts(limit = 0) {
    const products = await this.readFile();
    
    if (limit > 0) {
      return products.slice(0, limit);
    }
    
    return products;
  }
  async getProductById(id) {
    const products = await this.readFile();
    const product = products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  async updateProduct(id, updatedProduct) {
    const products = await this.readFile();

    const productIndex = products.findIndex((p) => p.id === parseInt(id));

    if (productIndex === -1) {
      throw new Error('Producto no encontrado');
    }

    // Actualizar los campos del producto con los datos actualizados
    products[productIndex] = { ...products[productIndex], ...updatedProduct };

    await this.writeFile(products);

    return products[productIndex];
  }
  async deleteProduct(id) {
    const products = await this.readFile();

    const updatedProducts = products.filter((p) => p.id !== 
    parseInt(id));

    if (updatedProducts.length === products.length) {
      throw new Error('Producto no encontrado');
    }

    await this.writeFile(updatedProducts);
  }
}

export default ProductManager;