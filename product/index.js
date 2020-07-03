const { sequelize } = require("../sequelize");
const { getUserById } = require("../user");

/**
 * Function to create product in db
 * @param req
 * @param res
 * @param next
 */
function createProduct(req, res, next) {
  const { name, price, photo } = req.body;
  const command = "INSERT INTO products (name, price, photo) VALUES (?, ?, ?)";
  sequelize
    .query(command, {
      raw: true,
      replacements: [name, price, photo],
    })
    .then((response) => {
      const [productCreated] = response;
      req.newProduct = { productId: productCreated };
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error occurred while creating the Product.",
      });
    });
}

/**
 * Function to obtain all products registered in db
 * @param  req
 * @param  res
 * @param  next
 */
function getProducts(req, res, next) {
  const query = "SELECT * FROM products";
  sequelize
    .query(query, {
      raw: true,
    })
    .then((response) => {
      const [productList] = response;
      if (productList.length) {
        req.products = { data: productList };
        next();
      } else {
        res.status(204).send(productList);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error ocurred while retrieving products",
      });
    });
}

/**
 * Function to validate if product id exists in db
 * @param  req
 * @param  res
 * @param  next
 */
async function findProductById(req, res, next) {
  try {
    const productId = req.params.productId;
    const [product] = await getProductById(productId);
    if (product.length) {
      req.product = { data: product };
      next();
    } else {
      res.status(400).send({
        message: `Product with id: ${productId} does not exits`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Some error ocurred while retrieving product",
    });
  }
}

/**
 * Function to find product by id
 * @param  id
 */
async function getProductById(id) {
  const query = "SELECT * FROM products WHERE id = ?";
  const product = await sequelize.query(query, {
    raw: true,
    replacements: [id],
  });
  return product;
}

/**
 * Function to delete a product from db
 * @param  req
 * @param  res
 * @param  next
 */
function deleteProduct(req, res, next) {
  const productId = req.params.productId;
  const command = "DELETE FROM products WHERE id = ?";
  sequelize
    .query(command, { raw: true, replacements: [productId] })
    .then(() => {
      req.isDeleted = true;
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error occurred while removing the product.",
      });
    });
}

/**
 * Function to update product information
 * @param req
 * @param res
 * @param next
 */
function updateProduct(req, res, next) {
  const { product } = req;
  const newProperties = req.body;
  const id = req.params.id;
  const updatedProduct = productChanges(product.data[0], newProperties);
  const { name, price, photo } = updatedProduct;
  const command =
    "UPDATE products SET name = ? , price = ?, photo = ? WHERE id = ?";
  sequelize
    .query(command, {
      raw: true,
      replacements: [name, price, photo, id],
    })
    .then((response) => {
      req.updatedProduct = updatedProduct;
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error occurred while updating the product.",
      });
    });
}

/**
 * Function to get the favorites products of a user
 * @param req
 * @param res
 * @param next
 */
async function getUserFavorites(req, res, next) {
  const userId = req.params.userId;
  const [user] = await getUserById(userId);
  if (user.length) {
    const query =
      "SELECT pro.name, pro.price, pro.photo FROM products pro INNER JOIN order_item ori ON (ori.product_id = pro.id) INNER JOIN orders ord ON (ord.id = ori.order_id) WHERE ord.user_id = ? group by ori.product_id ORDER BY COUNT(pro.id) DESC LIMIT 3";
    sequelize
      .query(query, { raw: true, replacements: [userId] })
      .then((response) => {
        const [favorites] = response;
        if (favorites.length) {
          req.favorites = { data: favorites };
          next();
        } else {
          res.status(204).send(favorites);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({
          message: "Some error ocurred while retrieving user favorites",
        });
      });
  } else {
    res.status(400).send({
      message: `User with id: ${userId} does not exits`,
    });
  }
}

/**
 * Function to apply changes to the information of a product
 * @param product
 * @param propertiesChange
 */
function productChanges(product, propertiesChange) {
  const properties = Object.keys(propertiesChange).filter(
    (property) =>
      propertiesChange[property] &&
      propertiesChange[property] !== " " &&
      propertiesChange[property] !== "null" &&
      propertiesChange[property] !== "undefined" &&
      /\S/.test(propertiesChange[property])
  );
  let newProperties = properties.reduce((obj, property) => {
    obj[property] = propertiesChange[property];
    return obj;
  }, {});
  const updatedProduct = { ...product, ...newProperties };
  return updatedProduct;
}

/**
 * Function to validate the product information
 * @param req
 * @param res
 * @param next
 */
function validateProductData(req, res, next) {
  const { name, price, photo } = req.body;
  const errors = validateProductDataComplete(price, name, photo);
  if (!errors.length) {
    if (isNaN(price)) {
      res.status(400).send({
        message: "The price of product should be a number.",
      });
    } else {
      next();
    }
  } else {
    const missingParameters = errors.join(", ");
    res.status(400).send({
      message: `This parameters are required:  ${missingParameters}`,
    });
  }
}

/**
 * Function to validate if the product information is complete
 * @param price
 * @param name
 * @param photo
 */
function validateProductDataComplete(price, name, photo) {
  let missingParameters = [];
  if (!name || !/\S/.test(name)) {
    missingParameters.push("name");
  }
  if (!photo || !/\S/.test(photo)) {
    missingParameters.push("photo");
  }
  if (!price) {
    missingParameters.push("price");
  }
  return missingParameters;
}

/**
 * Function to validate if product price is a number
 * @param req
 * @param res
 * @param next
 */
function validateProductPrice(req, res, next) {
  const { price } = req.body;
  if (price && isNaN(price)) {
    res.status(400).send({
      message: "The price of product should be a number.",
    });
  } else {
    return next();
  }
}

module.exports = {
  createProduct,
  validateProductData,
  getProducts,
  findProductById,
  deleteProduct,
  updateProduct,
  validateProductPrice,
  getProductById,
  getUserFavorites,
};
