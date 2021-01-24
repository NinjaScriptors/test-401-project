'use strict';

const jwt = require('jsonwebtoken');
const User = require('./src/auth/models/users/user-schema.js');

const generateToken = (user) => {
  console.log('inside getToken()');
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
    },
    process.env.SECRET || 'somethingsecret',
    {
      expiresIn: '30d',
    }
  );
};

const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  try{
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(
      token,
      process.env.SECRET || 'somethingsecret',
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: 'Invalid Token' });
        } else {
          req.user = decode;
          console.log('decoded from isAuth>>>',req.user);
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: 'No Token' });
  }

  }
  catch(e){
    console.log(e);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};


const isSeller = (req, res, next) => {
  console.log('req.user.isSeller >>>', req.user.isSeller);
  console.log('req.user >>>', req.user);

  if (req.user && req.user.isSeller) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Seller Token' });
  }
};


const isSellerOrAdmin =async (req, res, next) => {
  console.log('req.user.isSeller >>>', req.user.isSeller);
  console.log('req.user >>>', req.user);
  let checkSeller = await User.find({_id:req.user._id});
  let checkIsSeller = checkSeller[0].isSeller;
  let checkIsAdmin = checkSeller[0].isAdmin;
  console.log('check.isSeller >>>', checkIsSeller);
  console.log('check.isAdmin >>>', checkIsAdmin);
  if (req.user && (checkIsSeller || checkIsAdmin)) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin/Seller Token' });
  }
};
module.exports = { generateToken, isAuth, isAdmin, isSeller, isSellerOrAdmin };