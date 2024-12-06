import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util';

// Create an array listProducts containing the list of products
const listProducts = [
  { id: 1, name: "Suitcase 250", price: 50, stock: 4 },
  { id: 2, name: "Suitcase 450", price: 100, stock: 10 },
  { id: 3, name: "Suitcase 650", price: 350, stock: 2 },
  { id: 4, name: "Suitcase 1050", price: 550, stock: 5 }
];

// Create a function named getItemById
function getItemById(id) {
  return listProducts.find(product => product.id === id);
}

// Set up the Express server
const app = express();
const port = 1245;

// Create a client to connect to the Redis server
const client = createClient();
client.on('error', (err) => console.error('Redis Client Error', err));

const reserveStockById = (itemId, stock) => {
  client.set(`item.${itemId}`, stock);
};

const getCurrentReservedStockById = async (itemId) => {
  const getAsync = promisify(client.get).bind(client);
  const stock = await getAsync(`item.${itemId}`);
  return stock;
};

// Create the route GET /list_products
app.get('/list_products', (req, res) => {
  res.json(listProducts.map(product => ({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock
  })));
});

// Create the route GET /list_products/:itemId
app.get('/list_products/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const product = getItemById(itemId);
  if (!product) {
    return res.json({ status: 'Product not found' });
  }

  const reservedStock = await getCurrentReservedStockById(itemId);
  const currentQuantity = product.stock - (reservedStock ? parseInt(reservedStock) : 0);

  res.json({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock,
    currentQuantity
  });
});

// Create the route GET /reserve_product/:itemId
app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const product = getItemById(itemId);
  if (!product) {
    return res.json({ status: 'Product not found' });
  }

  const reservedStock = await getCurrentReservedStockById(itemId);
  const currentQuantity = product.stock - (reservedStock ? parseInt(reservedStock) : 0);

  if (currentQuantity <= 0) {
    return res.json({ status: 'Not enough stock available', itemId });
  }

  reserveStockById(itemId, (reservedStock ? parseInt(reservedStock) : 0) + 1);
  res.json({ status: 'Reservation confirmed', itemId });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

