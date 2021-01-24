'use strict';

const express = require('express');
require('dotenv').config();
const userRouter = require('./auth/routes/userRoute.js');
const productRouter = require('./auth/routes/productsRoute.js');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

module.exports = {
  server: app,
  start: port => {
      let PORT = port || process.env.PORT || 3000;
      app.listen(PORT, () => {
          console.log(`Listening on ${PORT}`);
      })
  }
};