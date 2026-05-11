const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    quantity: Number,
    price: Number,
    image: String
});

module.exports = mongoose.model("Book", bookSchema);
