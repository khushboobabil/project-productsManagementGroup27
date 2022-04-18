const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const objectId = require('mongoose').Types.ObjectId



const isValid = function (value) {
    if (typeof value === undefined || value === null) return false
    if (typeof value === 'String' && value.trim().length === 0) return false
    if (typeof value === 'Number' && value.trim().length === 0) return false
    return true;
}

const addtocart = async function (req, res) {
  try{ 
       let data = req.body;
    if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: "Please provide input " }) }

    let cId = data.cartId;
    let pId = data.productId;
  
    if (!pId) { return res.status(400).send({ status: false, message: "Please provide Product Id " }) }

    let uId = req.params.userId;
    if (Object.keys(uId) == 0) { return res.status(400).send({ status: false, message: "Please provide User Id " }) }

    let userExist = await userModel.findOne({ _id: uId });
    if (!userExist) {
        return res.status(404).send({ status: false, message: `No user found with this ${uId}` })
    }

    let cartExist = await cartModel.findOne({ _id: cId });
    if (cartExist) {
        if (cartExist.userId != uId) {
            return res.status(403).send({ status: false, message: "This cart does not belong to you. Please check the cart Id" })
        }
        let updateData = {}

        for (let i = 0; i < cartExist.items.length; i++) {
            if (cartExist.items[i].productId == pId) {
                cartExist.items[i].quantity = cartExist.items[i].quantity + 1;

                updateData['items'] = cartExist.items
                const productPrice = await productModel.findOne({ _id: pId, isDeleted: false }).select({ price: 1, _id: 0 })
                if (!productPrice) { return res.status(404).send({ status: false, message: `No product found with this ${pId}` }) }
                nPrice = productPrice.price;
                updateData['totalPrice'] = cartExist.totalPrice + (nPrice * 1)
                updateData['totalItems'] = cartExist.items.length;

                const updatedCart = await cartModel.findOneAndUpdate({ _id: cId }, updateData, { new: true })
                return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
            }
            if (cartExist.items[i].productId !== pId && i == cartExist.items.length - 1) {
                const obj = { productId: pId, quantity: 1 }
                let arr = cartExist.items
                arr.push(obj)
                updateData['items'] = arr

                const productPrice = await productModel.findOne({ _id: pId, isDeleted: false }).select({ price: 1, _id: 0 })
                if (!productPrice) { return res.status(404).send({ status: false, message: `No product found with this ${pId}` }) }
                nPrice = productPrice.price
                updateData['totalPrice'] = cartExist.totalPrice + (nPrice * 1)
                updateData['totalItems'] = cartExist.items.length;

                const updatedCart = await cartModel.findOneAndUpdate({ _id: cId }, updateData, { new: true })
                return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
            }
        }

    }
    else {
        let newData = {}
        let arr = []
        newData.userId = uId;

        const object = { productId: pId, quantity: 1 }
        arr.push(object)
        newData.items = arr;

        const productPrice = await productModel.findOne({ _id: pId, isDeleted: false }).select({ price: 1, _id: 0 })
        if (!productPrice) { return res.status(404).send({ status: false, mesaage: `No product found with this ${pId}` }) }
        nPrice = productPrice.price;
        newData.totalPrice = nPrice;

        newData.totalItems = arr.length;

        const newCart = await cartModel.create(newData)

        return res.status(201).send({ status: true, message: "Cart details", data: newCart })


    }}
catch(err){
    return res.status(500).send({status:false, msg:err.mesaage})
}}




const getCart = async function (req, res) {

try{    let user = req.params.userId

    const userCheck = await userModel.findOne({ _id: user })

    if (!userCheck) { return res.status(404).send({ status: false, msg: "user not found" }) }

    const cart = await cartModel.findOne({ userId: user }).select({ _id: 1 })

    if (!cart) { return res.status(404).send({ status: false, msg: "Cart not found" }) }

    console.log(cart)

    const findCart = await cartModel.findOne({ _id: cart, isDeleted: false })

    return res.status(200).send({ status: true, msg: findCart })

}catch(err){
    return res.status(500).send({status:false, msg:err.mesaage})
}}

//...........................updatecart...........................
const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const { cartId, productId, removeProduct } = req.body

        const key = Object.keys(req.body)

        if (key == 0) {
            return res.status(400).send({ status: false, msg: "please enter some data" })
        }

        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }

        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is required" })
        }

        if (!objectId.isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is invalid" })
        }

        if (!isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is required" })
        }

        if (!objectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" })
        }

        if (!isValid(removeProduct)) {
            return res.status(400).send({ status: false, msg: "removeProduct is required" })
        }

        let cartData = await cartModel.findById(cartId)
        if (!cartData) { return res.status(404).send({ status: false, msg: "cartData not found !" }) 
    }

        if (isValid(removeProduct)) {
            if (typeof removeProduct != Number) {
                return res.status(400).send({ status: false, msg: "only number are allowed!" })
            }
        }
        if (removeProduct == 0) {
            let items = []
            let dataObj = {}
            let removePrice = 0
            for (let i = 0; i < cartData.length; i++) {
                if (cartData.items[i].productId != productId) {
                    return res.status(400).send({ status: false, msg: "product not found in the cart" })
                }
                if (cartData.items[i].productId == productId) {
                    const productRes = await productModel.findOne({ _id: productId, isDeleted: false })
                    if (!productRes) { return res.status(404).send({ status: false, msg: "product not found !" }) }
                    removePrice = productRes.price * cartData.items[i].quantity
                }
                items.push(cartData.items[i])

            }
            productPrice = cartData.totalPrice - removePrice
            dataObj.totalPrice = productPrice
            dataObj.totalItems = items.length
            dataObj.items = items
            const removeRes = await cartModel.findOneAndUpdate({ productId: productId }, dataObj, { new: true })
            return res.status(200).send({ status: true, message: "remove success", data: removeRes })

        }
        if(removeProduct == 1) {
            let dataObj = {}
            let item =[]
            let productPrice = 0
            for (let i = 0; i < cartData.length; i++) {
                if (cartData.items[i].productId != productId) {
                    return res.status(400).send({ status: false, msg:  "product not found in the cart" })
                }
                if (cartData.items[i].productId == productId) {
                    const productRes = await productModel.findOne({ _id: productId, isDeleted: false })
                    if (!productRes) { return res.status(404).send({ status: false, msg: "product not found !" }) }
                    item.push({productId:productId,quantity:cartData.items[i].quantity - 1})
                    dataObj.totalPrice = cartData.totalPrice - productRes.price
                    dataObj.totalItems = item.length
                    dataObj.items = item
                    
                }
                const reduceData = await cartModel.findOneAndUpdate({productId:productId},dataObj,{new:true})
                
                return res.status(200).send({ status: true, message: "success", data:reduceData})

            }

        }
        else{
            return res.status(400).send({ status: false, msg: "removeProduct field should be allowed only 0 and 1 " }) 
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

//............................deletecart.....................................

const deleteCart = async function (req, res) {
    let user = req.params.userId

    const userCheck = await userModel.findOne({ _id: user })

    if (!userCheck) { return res.status(404).send({ status: false, msg: "user not found" }) }

    const cart = await cartModel.findOne({ userId: user }).select({ _id: 1 })

    if (!cart) { return res.status(404).send({ status: false, msg: "Cart not found" }) }

    const deletecartwithSize = await cartModel.findOneAndUpdate({ _id: cart }, { $set: { items:[],totalItems:0,totalPrice:0} }, { new: true })

    return res.status(200).send({ status: false, message: "the requested cart has been deleted successfully" })
}




module.exports.addtocart = addtocart
module.exports.getCart = getCart
module.exports.deleteCart = deleteCart
module.exports.updateCart =updateCart