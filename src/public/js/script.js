const socket = io(); // Establecer conexión con el servidor

socket.on('newProduct', (products) => {
  console.log('Received new products:', products); // Agregar esta línea para mostrar los productos en la consola
  updateProductList(products);
});

socket.on('productDeleted', (productId) => {
  removeProduct(productId);
});

function updateProductList(products) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  products.forEach((product) => {
    const listItem = document.createElement('li');
    listItem.setAttribute('data-product-id', product.id); // Agregar el atributo al elemento
    listItem.innerHTML = `${product.name} - $${product.price} <button onclick="deleteProduct('${product.id}')">Eliminar</button>`;
    productList.appendChild(listItem);
  });
}


function removeProduct(productId) {
  const productToRemove = document.querySelector(`[data-product-id="${productId}"]`);
  if (productToRemove) {
    productToRemove.remove();
  }
}

function createProduct() {
  const productName = document.getElementById('productName').value;
  const productPrice = parseFloat(document.getElementById('productPrice').value);
  if (productName && !isNaN(productPrice)) {
    const newProduct = { name: productName, price: productPrice };
    socket.emit('newProduct', newProduct); // Emitir el evento con el nuevo producto
  }
}

function deleteProduct(productId) {
  socket.emit('deleteProduct', productId);
}
