'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  // _id: Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: {
    type: String, required: true, unique: true, index: true, dropDups: true,
  },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false, required: true },
  isSeller: { type: Boolean, default: false, required: true },
  // role: { type: String, required: true, enum: ['admin', 'seller', 'buyer]},
  seller: {
    name: String,
    logo: String,
    description: String,
    rating: { type: Number, default: 0, required: true },
    numReviews: { type: Number, default: 0, required: true },
  },
},
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('User', userSchema);