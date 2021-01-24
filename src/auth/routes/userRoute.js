'use strict';

const express = require('express');
const User = require('../models/users/user-schema.js');
const { generateToken, isAdmin, isAuth } = require('../../../util');
const bcrypt = require('bcryptjs');
const userRouter = express.Router();


userRouter.post('/signin', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        token: generateToken(user),
      });
      return;
    }
  }
  res.status(401).send({ message: 'Invalid email or password' });
});

userRouter.post('/signup', async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    // isAdmin: req.body.isAdmin,
    isSeller: req.body.isSeller
  });
  const createdUser = await user.save();
  console.log('Created User >>>', user);
  res.send({
    _id: createdUser._id,
    name: createdUser.name,
    email: createdUser.email,
    isAdmin: createdUser.isAdmin,
    isSeller: user.isSeller,
    token: generateToken(createdUser),
  });
  console.log('TOKEN >>>', generateToken(createdUser));
});

userRouter.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  console.log('User get/:id >>>', user);
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ message: 'User Not Found' });
  }
});

userRouter.get('/', isAuth, async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

userRouter.delete('/:id', isAuth, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    //if (user.isAdmin === true)
    if (user.email === 'admin@example.com') {
      res.status(400).send({ message: 'Can Not Delete Admin User' });
      return;
    }
    const deleteUser = await user.remove();
    console.log('Deleted User >>>', deleteUser);
    res.send({ message: 'User Deleted', user: deleteUser });
  } else {
    res.status(404).send({ message: 'User Not Found' });
  }
});

//Update from buyer to seller by User
userRouter.put('/:id', isAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isSeller = Boolean(req.body.isSeller) || user.isSeller;
    req.user.isSeller = true;
    // user.isAdmin = Boolean(req.body.isAdmin);
    // user.isAdmin = req.body.isAdmin || user.isAdmin;
    const updatedUser = await user.save();
    console.log('Updated User >>>', updatedUser);
    res.send({ message: 'User Updated', user: updatedUser });
  } else {
    res.status(404).send({ message: 'User Not Found' });
  }
});

//Update from buyer to admin by Admin
userRouter.put('/:id/admin', isAuth, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    // user.isSeller = Boolean(req.body.isSeller);
    user.isAdmin = Boolean(req.body.isAdmin);
    // user.isAdmin = req.body.isAdmin || user.isAdmin;
    const updatedUser = await user.save();
    console.log('Updated to Admin >>>', updatedUser);
    res.send({ message: 'User Updated', user: updatedUser });
  } else {
    res.status(404).send({ message: 'User Not Found' });
  }
});


module.exports = userRouter;