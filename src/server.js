const express = require('express');
const app = express();
const productsRouter = require('./routes/products.routes');
const cartsRouter = require('./routes/carts.routes');

const PORT = 8080;

app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
  res.send('API funcionando. Endpoints: /api/products y /api/carts');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
