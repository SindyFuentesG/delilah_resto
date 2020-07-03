const { JWT, secretKey } = require("./config");

/**
 * Function login a user and get access token
 * @param req
 * @param res
 * @param next
 */
function loginUser(req, res, next) {
  const { registeredUser } = req;
  const { user, password } = req.body;
  const { password: userPassword, is_admin } = registeredUser;
  if (userPassword === password) {
    const token = JWT.sign({ user, is_admin }, secretKey, {
      expiresIn: "20m",
    });
    req.token = { token: token };
    next();
  } else {
    res.status(400).send({
      message: "Wrong credentials",
    });
  }
}

/**
 * Function to validate access token
 * @param req
 * @param res
 * @param next
 */
function validateAuthentication(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (token) {
      const validateToken = JWT.verify(token.split(" ")[1], secretKey);
      if (validateToken) {
        const { is_admin, user } = validateToken;
        req.is_admin = is_admin;
        req.user = user;
        next();
      } else {
        res.status(401).send({
          message: "You don't have permissions to do this action",
        });
      }
    } else {
      res.status(403).send({
        message: "Forbbiden",
      });
    }
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      res.status(403).send({
        message: "Token has expired, please login again",
      });
    } else {
      res.status(403).send({
        message: "Forbbiden",
      });
    }
  }
}

/**
 * Function to validate if a user is administrator
 * @param req
 * @param res
 * @param next
 */
function validateAdmin(req, res, next) {
  const { is_admin } = req;
  if (is_admin) {
    next();
  } else {
    res.status(401).send({
      message: "You don't have permissions to do this action",
    });
  }
}

module.exports = { loginUser, validateAuthentication, validateAdmin };
