const mongoose = require('mongoose');
const {Schema, model} = require('mongoose');

const productSchema = new Schema({
      productName:{ type: String, require: true, unique: false}, 
      price: { type: String, require: true },
      category: {type: String, require: true},
      createdAt: { type: String, require: true},
      brand: {type: String},
      likes: [{type: String}], //array of usernames
      //comments
      comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      commentId: {type: String},
      username: {type: String},
      profilePic: {type: String},
      comment: { type: String },
      createdAt: { type: String },
      likes: [{type: String}] // will be array of usernames
}],


        isSold: {type: Boolean},
        mainImage: { type: String, required: true },
        images: [{type: String, required: true }],
        description: { type: String, required: true },
        acceptOffers: {type: String, require: true},

        colors:[{type:String}], 
        options: [{type: String}],
        wholesale: {type: String},
        quantity: {type: String, require: true},
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
  }
});

const Product = model('Product', productSchema);

module.exports = Product;