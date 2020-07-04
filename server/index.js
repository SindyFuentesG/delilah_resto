const express = require("express");
const server = express();
server.use(express.json());
const {
  createProduct,
  validateProductData,
  getProducts,
  findProductById,
  deleteProduct,
  updateProduct,
  validateProductPrice,
  getUserFavorites,
} = require("../product");

const {
  createUser,
  validateUserCreated,
  getUsers,
  findUser,
  validateUserData,
  findUserById,
  validateLoginData,
} = require("../user");

const { loginUser, validateAuthentication, validateAdmin } = require("../auth");

const {
  validateProducts,
  validateOrderData,
  createOrder,
  getOrders,
  findyOrderById,
  getOrderDetails,
  updateOrderStatus,
  validateUpdateOrderStatus,
  validateProductWithAssociatedOrders,
  deleteOrder,
} = require("../order");

server.listen(3000, (req, res) => console.log("listening port 3000"));

//product enpoints
server.post(
  "/v1/products/",
  validateAuthentication,
  validateAdmin,
  validateProductData,
  createProduct,
  (req, res) => {
    const { newProduct } = req;
    res.status(201).json(newProduct);
  }
);

server.get("/v1/products/", validateAuthentication, getProducts, (req, res) => {
  const { products } = req;
  res.status(200).json(products);
});

server.get(
  "/v1/products/:productId",
  validateAuthentication,
  findProductById,
  (req, res) => {
    const { product } = req;
    res.status(200).json(product);
  }
);

server.delete(
  "/v1/products/:productId",
  validateAuthentication,
  validateAdmin,
  findProductById,
  validateProductWithAssociatedOrders,
  deleteProduct,
  (req, res) => {
    const { isDeleted } = req;
    isDeleted &&
      res.status(200).send({
        message: "Product deleted",
      });
  }
);

server.put(
  "/v1/products/:productId",
  validateAuthentication,
  validateAdmin,
  findProductById,
  validateProductPrice,
  updateProduct,
  (req, res) => {
    const { updatedProduct } = req;
    res.status(200).json(updatedProduct);
  }
);

server.get(
  "/v1/products/favorites/:userId",
  validateAuthentication,
  getUserFavorites,
  (req, res) => {
    const { favorites } = req;
    res.status(200).json(favorites);
  }
);

//user endpoints
server.post(
  "/v1/users/",
  validateUserData,
  validateUserCreated,
  createUser,
  (req, res) => {
    const { newUser } = req;
    res.status(201).json(newUser);
  }
);

server.get(
  "/v1/users/",
  validateAuthentication,
  validateAdmin,
  getUsers,
  (req, res) => {
    const { users } = req;
    res.status(200).json(users);
  }
);

server.post(
  "/v1/users/login",
  validateLoginData,
  findUser,
  loginUser,
  (req, res) => {
    const { token } = req;
    res.status(200).json(token);
  }
);

//order enpoints
server.post(
  "/v1/orders",
  validateAuthentication,
  validateOrderData,
  findUserById,
  validateProducts,
  createOrder,
  (req, res) => {
    const { newOrder } = req;
    res.status(201).json(newOrder);
  }
);

server.get(
  "/v1/orders",
  validateAuthentication,
  validateAdmin,
  getOrders,
  (req, res) => {
    const { orders } = req;
    res.status(200).json(orders);
  }
);

server.get(
  "/v1/orders/:orderId",
  validateAuthentication,
  findyOrderById,
  getOrderDetails,
  (req, res) => {
    const { order } = req;
    res.status(200).json(order);
  }
);

server.put(
  "/v1/orders/:orderId",
  validateAuthentication,
  validateAdmin,
  validateUpdateOrderStatus,
  findyOrderById,
  updateOrderStatus,
  (req, res) => {
    const { registeredOrder } = req;
    res.status(200).json(registeredOrder);
  }
);

server.delete(
  "/v1/orders/:orderId",
  validateAuthentication,
  validateAdmin,
  findyOrderById,
  deleteOrder,
  (req, res) => {
    const { isDeleted } = req;
    isDeleted &&
      res.status(200).send({
        message: "Order deleted",
      });
  }
);
