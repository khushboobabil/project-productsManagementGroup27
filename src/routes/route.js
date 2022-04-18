const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const cartController = require("../controllers/cartController")
const productController = require("../controllers/productController")
const middleware = require("../middleware/middleware")



//users..............................................

router.post("/register", userController.createUser);

router.post("/login", userController.login);

router.get("/user/:userId/profile", middleware.authentication, userController.getUser);

router.put("/user/:userId/profile", middleware.authentication, middleware.authorization, userController.updateUserProfile);

//product...........................................

router.post("/products", productController.createProduct);

router.get("/products", productController.filterProducts);

router.get("/products/:productId", productController.getProduct);

router.put("/products/:productId", productController.updateProduct);

router.delete("/products/:productId", productController.deleteProduct);

//Cart..................................................

router.post("/users/:userId/cart", middleware.authentication, middleware.authorization, cartController.addtocart);

router.put("/users/:userId/cart", middleware.authentication, middleware.authorization, cartController.updateCart);

router.get("/users/:userId/cart", middleware.authentication, middleware.authorization, cartController.getCart);

router.delete("/users/:userId/cart", middleware.authentication, middleware.authorization, cartController.deleteCart);

module.exports = router;