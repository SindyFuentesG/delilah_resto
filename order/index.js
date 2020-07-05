const { sequelize } = require("../sequelize");
const { getProductById } = require("../product");

/**
 * Function to create a new order in db
 * @param req
 * @param res
 * @param next
 */
function createOrder(req, res, next) {
  const { user_id, payment_type, items } = req.body;
  const { amount, description } = req;
  const time = new Date().toLocaleTimeString();
  const command =
    "INSERT INTO orders (status, payment_type, time, description, amount, user_id) VALUES (?, ?, ?, ?, ?, ?)";
  sequelize
    .query(command, {
      raw: true,
      replacements: ["new", payment_type, time, description, amount, user_id],
    })
    .then((response) => {
      const [orderCreated] = response;
      req.newOrder = { orderId: orderCreated };
      const commandItems =
        "INSERT INTO order_item (product_id, order_id, quantity) VALUES (?, ?, ?)";
      items.forEach((item) => {
        sequelize
          .query(commandItems, {
            raw: true,
            replacements: [item.productId, orderCreated, item.quantity],
          })
          .then(() => {
            next();
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({
              message: "Some error occurred while creating order items.",
            });
          });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error occurred while creating order.",
      });
    });
}

/**
 * Function to obtain all orders registered in db
 * @param req
 * @param res
 * @param next
 */
function getOrders(req, res, next) {
  const query =
    "SELECT ord.id as order_number, ord.status, ord.time, ord.description, ord.amount, ord.payment_type, usr.full_name, usr.address FROM orders ord  INNER JOIN users usr ON (usr.id = ord.user_id)";
  sequelize
    .query(query, {
      raw: true,
    })
    .then((response) => {
      const [orderList] = response;
      if (orderList.length) {
        req.orders = { data: orderList };
        next();
      } else {
        res.status(204).send(orderList);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error ocurred while retrieving orders",
      });
    });
}

/**
 * Function to find an order by id
 * @param req
 * @param res
 * @param next
 */
function findyOrderById(req, res, next) {
  const orderId = req.params.orderId;
  const query = "SELECT * FROM orders WHERE id = ?";
  sequelize
    .query(query, { raw: true, replacements: [orderId] })
    .then((response) => {
      const [order] = response;
      if (order.length) {
        req.registeredOrder = order;
        next();
      } else {
        res.status(400).send({
          message: `order with id: ${orderId} does not exits`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error ocurred while retrieving order",
      });
    });
}

/**
 * Function to get the information details of an order by id
 * @param req
 * @param res
 * @param next
 */
function getOrderDetails(req, res, next) {
  const orderId = req.params.orderId;
  const { user, is_admin } = req;
  const query =
    "SELECT ord.id, ord.status, ord.time, ord.amount, ord.payment_type, usr.full_name, usr.username, usr.email, usr.address, usr.phone_number FROM orders ord  INNER JOIN users usr ON (usr.id = ord.user_id) WHERE ord.id = ? ";
  sequelize
    .query(query, { raw: true, replacements: [orderId] })
    .then((response) => {
      const [order] = response;
      console.log(order[0].username);
      console.log(user);
      if (order[0].username === user || is_admin) {
        const queryOrderItems =
          "SELECT ori.id, ori.product_id, pro.name, pro.price, pro.photo, ori.quantity FROM orders ord INNER JOIN order_item ori ON (ord.id = ori.order_id) INNER JOIN products pro ON (ori.product_id = pro.id) WHERE ord.id = ? ";
        sequelize
          .query(queryOrderItems, { raw: true, replacements: [orderId] })
          .then((responseItem) => {
            const [items] = responseItem;
            order[0].items = items;
            req.order = { data: order };
            next();
          })
          .catch((err) => {
            console.log(err);
            console.log(err);
            res.status(500).send({
              message: "Some error ocurred while retrieving order",
            });
          });
      } else {
        res.status(401).send({
          message: "You don't have permissions to do this action",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error ocurred while retrieving order",
      });
    });
}

/**
 * Function to update the status of an order
 * @param req
 * @param res
 * @param next
 */
function updateOrderStatus(req, res, next) {
  const orderId = req.params.orderId;
  const { order_status } = req.body;
  const command = "UPDATE orders SET status = ? WHERE id = ? ";
  sequelize
    .query(command, { raw: true, replacements: [order_status, orderId] })
    .then(() => {
      req.registeredOrder[0].status = order_status;
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error ocurred while updating order status",
      });
    });
}

/**
 * Function to delete an order from db
 * @param req
 * @param res
 * @param next
 */
function deleteOrder(req, res, next) {
  const orderId = req.params.orderId;
  const command = "DELETE FROM order_item WHERE order_id = ?";
  sequelize
    .query(command, { raw: true, replacements: [orderId] })
    .then(() => {
      const commandOrder = "DELETE FROM orders WHERE id = ?";
      sequelize
        .query(commandOrder, { raw: true, replacements: [orderId] })
        .then(() => {
          req.isDeleted = true;
          next();
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({
            message: "Some error occurred while removing the order items.",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error occurred while removing order.",
      });
    });
}

/**
 * Function to validate the products send in an order
 * @param req
 * @param res
 * @param next
 */
async function validateProducts(req, res, next) {
  const { items } = req.body;
  let amount = 0;
  let description = "";
  let hasError = false;
  let errorMessage = "";
  for (let index = 0; index < items.length; index++) {
    const productId = items[index].productId;
    const [registeredProduct] = await getProductById(productId);
    if (registeredProduct.length) {
      const quantity = items[index].quantity;
      if (quantity) {
        description = description + `${quantity}x${registeredProduct[0].name} `;
        amount = +amount + +(registeredProduct[0].price * quantity);
      } else {
        hasError = true;
        errorMessage = `missing quantity for productId: ${productId}`;
        break;
      }
    } else {
      hasError = true;
      errorMessage = `Product with id: ${productId} does not exits`;
      break;
    }
  }
  if (hasError) {
    res.status(400).send({
      message: errorMessage,
    });
  } else {
    req.amount = amount;
    req.description = description;
    next();
  }
}

/**
 * Function to validate the information of an order
 * @param req
 * @param res
 * @param next
 */
function validateOrderData(req, res, next) {
  const { user_id, payment_type, items } = req.body;
  const errors = validateOrderDataComplete(user_id, payment_type, items);
  if (!errors.length) {
    const validPaymentType = validatePaymentType(payment_type);
    if (validPaymentType) {
      next();
    } else {
      res.status(400).send({
        message: "Invalid payment type",
      });
    }
  } else {
    const missingParameters = errors.join(", ");
    res.status(400).send({
      message: `This parameters are required:  ${missingParameters}`,
    });
  }
}

/**
 * Function to validate order status
 * @param req
 * @param res
 * @param next
 */
function validateUpdateOrderStatus(req, res, next) {
  const { order_status } = req.body;
  if (order_status) {
    const validOrderStatus = validateOrderStatus(order_status);
    if (validOrderStatus) {
      next();
    } else {
      res.status(400).send({
        message: "Invalid order status",
      });
    }
  } else {
    res.status(400).send({
      message: "Order status is required",
    });
  }
}

/**
 * Function to validate if product has order associated
 * @param req
 * @param res
 * @param next
 */
function validateProductWithAssociatedOrders(req, res, next) {
  const id = req.params.id;
  const query = "SELECT * FROM order_item WHERE product_id = ?";
  sequelize.query(query, { raw: true, replacements: [id] }).then((response) => {
    const [ordersItem] = response;
    if (ordersItem.length) {
      res.status(409).send({
        message:
          "Product linked with some orders, please resolve the conflict ant try again",
      });
    } else {
      next();
    }
  });
}

/**
 * Function to validate if order information is complete
 * @param user_id
 * @param payment_type
 * @param items
 */
function validateOrderDataComplete(user_id, payment_type, items) {
  let missingParameters = [];
  if (!user_id) {
    missingParameters.push("user_id");
  }
  if (!payment_type || !/\S/.test(payment_type)) {
    missingParameters.push("payment_type");
  }
  if (!items || items.length < 1) {
    missingParameters.push("items");
  }
  return missingParameters;
}

/**
 * Function to validate payment type
 * @param paymentType
 */
function validatePaymentType(paymentType) {
  const validPaymentType = ["cash", "card"];
  const existingType = validPaymentType.find(
    (payment) => payment === paymentType
  );
  return existingType;
}

/**
 * Function to validate order status
 * @param orderStatus
 */
function validateOrderStatus(orderStatus) {
  const validOrderStatus = [
    "new",
    "confirmed",
    "preparing",
    "sent",
    "delivered",
    "canceled",
  ];
  const existingStatus = validOrderStatus.find(
    (status) => status === orderStatus
  );
  return existingStatus;
}

module.exports = {
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
};
