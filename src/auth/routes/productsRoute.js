'use strict';

const express = require('express');
const { isAdmin, isAuth, isSellerOrAdmin, isSeller } = require('../../../util');
const Product = require('../models/products/product-schema.js');
const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await Product.find({});
  res.send({ products });
});

productRouter.get('/categories', async (req, res) => {
  const categories = await Product.find().distinct('category');
  res.send(categories);
});

productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'seller',
    'seller.name seller.logo seller.rating seller.numReviews'
  );
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

productRouter.post('/', isAuth, isSellerOrAdmin, async (req, res) => {
  const product = new Product({
    name: 'sample name ' + Date.now(),
    seller: req.user._id,
    image: '/images/p1.jpg',
    price: 0,
    category: 'sample category',
    brand: 'sample brand',
    countInStock: 0,
    rating: 0,
    numReviews: 0,
    description: 'sample description',
  });
  console.log('Created Product >>>>', product);
  const createdProduct = await product.save();
  res.send({ message: 'Product Created', product: createdProduct });
});

//Can an Admin update other users' products ?
productRouter.put('/:id', isAuth, isSeller, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    if(req.user._id == product.seller  ){

      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      const updatedProduct = await product.save();
      console.log('Updated Product >>>>', updatedProduct);
      res.send({ message: 'Product Updated', product: updatedProduct });
    } else {
      res.status(404).send({ message: 'Product Not Found / You can not update this product' });
    }

    }
});

productRouter.delete('/:id', isAuth, isAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    const deleteProduct = await product.remove();
    console.log('Deleted Product >>>>', deleteProduct);
    res.send({ message: 'Product Deleted', product: deleteProduct });
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

productRouter.post('/:id/reviews', isAuth, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    if (product.reviews.find((x) => x.name === req.user.name)) {
      return res.status(400).send({ message: 'You already submitted a review' });
    }
    //http://localhost:3000/api/products/600c838b8eb6ad2450052af9/reviews
    /*
     "productId" : "600c838b8eb6ad2450052af9",
     "name":"USER21",
     "rating":"4",
     "comment":"nice product"
    */
    const review = {
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    console.log('Review for product',productId, ' is', review);
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      message: 'Review Created',
      review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
    });
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

module.exports = productRouter;