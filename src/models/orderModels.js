const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
    













}, { timestamps: true })

module.exports = mongoose.model("orders", orderSchema);

// {
//     userId: {ObjectId, refs to User, mandatory},
//     items: [{
//       productId: {ObjectId, refs to Product model, mandatory},
//       quantity: {number, mandatory, min 1}
//     }],
//     totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
//     totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
//     totalQuantity: {number, mandatory, comment: "Holds total number of items in the cart"},
//     cancellable: {boolean, default: true},
//     status: {string, default: 'pending', enum[pending, completed, cancled]},
//     deletedAt: {Date, when the document is deleted}, 
//     isDeleted: {boolean, default: false},
//     createdAt: {timestamp},
//     updatedAt: {timestamp},
//   }