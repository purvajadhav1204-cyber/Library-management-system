const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    username: String,
    bookTitle: String,
    amount: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Payment", paymentSchema);
