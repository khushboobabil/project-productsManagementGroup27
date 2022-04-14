const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
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


module.exports = router;