// grab the mongoose module
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var cocktailSchema = new Schema({
    id: Number,
    menuId: Number,
    name: String,
    price: Number,
    state: String,
    imageUrl: String
});

// define our model
var Cocktail = mongoose.model('Cocktail', cocktailSchema);

// make this available in Node applications
module.exports = Cocktail;