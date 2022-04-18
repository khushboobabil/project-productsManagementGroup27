const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId


const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'users',
        required: true,
        unique: true
    },
    items:[ 
        {
        productId: {
            type:ObjectId,
            ref: 'products',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            minlen: 1
        },},],
    totalPrice: {
        type: Number,
        required: "Enter total amount",
        //comment:""
    },
    totalItems: {
        type: Number,
        required:"enter the total no. of product",
        //comment:""
    },
}, { timestamps: true })

module.exports = mongoose.model("carts", cartSchema);

