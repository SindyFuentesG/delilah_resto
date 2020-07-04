const { sequelize } = require("../sequelize");

/**
 * Function to create new user in db
 * @param req
 * @param res
 * @param next
 */
function createUser(req, res, next) {
  const {
    username,
    name,
    email,
    phone,
    address,
    password,
    is_admin,
  } = req.body;
  const command =
    "INSERT INTO users (username, full_name, email, phone_number, address, password, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)";
  sequelize
    .query(command, {
      raw: true,
      replacements: [username, name, email, phone, address, password, is_admin],
    })
    .then((response) => {
      const [userCreated] = response;
      req.newUser = { userId: userCreated };
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error ocurred while creating user",
      });
    });
}

/**
 * Function to get all the users registered in db
 * @param req
 * @param res
 * @param next
 */
function getUsers(req, res, next) {
  const query = "SELECT * FROM users";
  sequelize
    .query(query, {
      raw: true,
    })
    .then((response) => {
      const [userList] = response;
      if (userList.length) {
        req.users = { data: userList };
        next();
      } else {
        res.status(204).send(userList);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error ocurred while retrieving users",
      });
    });
}

/**
 * Function to validate if user id exists in db
 * @param req
 * @param res
 * @param next
 */
async function findUserById(req, res, next) {
  try {
    const { user_id } = req.body;
    const [user] = await getUserById(user_id);
    if (user.length) {
      next();
    } else {
      res.status(400).send({
        message: `User with id: ${user_id} does not exits`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Some error ocurred while retrieving user",
    });
  }
}

/**
 * Function to find user by id
 * @param userId
 */
async function getUserById(userId) {
  const query = "SELECT * FROM users WHERE id = ?";
  const user = await sequelize.query(query, {
    raw: true,
    replacements: [userId],
  });
  return user;
}

/**
 * Function to find user by email or username
 * @param req
 * @param res
 * @param next
 */
function findUser(req, res, next) {
  const { user } = req.body;
  const query = "SELECT * FROM users WHERE email = ? OR username = ?";
  sequelize
    .query(query, { raw: true, replacements: [user, user] })
    .then((response) => {
      const [registeredUser] = response;
      if (registeredUser.length) {
        req.registeredUser = registeredUser[0];
        next();
      } else {
        res.status(400).send({
          message: "Wrong credentials",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error ocurred while validating credentials",
      });
    });
}

/**
 * Function to validate if email and username already exist in db
 * @param req
 * @param res
 * @param next
 */
function validateUserCreated(req, res, next) {
  const { email, username } = req.body;
  const queryEmail = "SELECT * FROM users WHERE email = ?";
  sequelize
    .query(queryEmail, { raw: true, replacements: [email] })
    .then((response) => {
      const [user] = response;
      if (user.length) {
        res.status(400).send({
          message: "User already exists",
        });
      } else {
        const queryUsername = "SELECT * FROM users WHERE username = ?";
        sequelize
          .query(queryUsername, { raw: true, replacements: [username] })
          .then((responseUsername) => {
            const [userUsername] = responseUsername;
            if (userUsername.length) {
              res.status(400).send({
                message: "User in use",
              });
            } else {
              next();
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({
              message: "Some error ocurred while validating username",
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Some error ocurred while validating email",
      });
    });
}

/**
 * Function to validate the information to create a user
 * @param req
 * @param res
 * @param next
 */
function validateUserData(req, res, next) {
  const { is_admin } = req.body;
  const errors = validateUserDataComplete(req);
  if (!errors.length) {
    if (!(is_admin == 1 || is_admin == 0)) {
      res.status(400).send({
        message: "is_admin should be 0 or 1",
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
 * Function to validate login data
 * @param  req
 * @param  res
 * @param  next
 */
function validateLoginData(req, res, next) {
  const { user, password } = req.body;
  const errors = validateLoginDataComplete(user, password);
  if (!errors.length) {
    next();
  } else {
    const missingParameters = errors.join(", ");
    res.status(400).send({
      message: `This parameters are required:  ${missingParameters}`,
    });
  }
}

/**
 * Function to validate if the user information to login is complete
 * @param user
 * @param  password
 */
function validateLoginDataComplete(user, password) {
  let missingParameters = [];
  if (!user || !/\S/.test(user)) {
    missingParameters.push("user (username or email)");
  }
  if (!password || !/\S/.test(password)) {
    missingParameters.push("password");
  }
  return missingParameters;
}
/**
 * Function to validate if user information is complete
 * @param req
 */
function validateUserDataComplete(req) {
  let missingParameters = [];
  const {
    username,
    name,
    email,
    phone,
    address,
    password,
    is_admin,
  } = req.body;
  if (!username || !/\S/.test(username)) {
    missingParameters.push("username");
  }
  if (!name || !/\S/.test(name)) {
    missingParameters.push("name");
  }
  if (!phone || !/\S/.test(phone)) {
    missingParameters.push("phone");
  }
  if (!email || !/\S/.test(email)) {
    missingParameters.push("email");
  }
  if (!address || !/\S/.test(address)) {
    missingParameters.push("address");
  }
  if (!password || !/\S/.test(password)) {
    missingParameters.push("password");
  }
  if (is_admin == null || is_admin == undefined) {
    missingParameters.push("is_admin");
  }
  return missingParameters;
}

module.exports = {
  createUser,
  validateUserCreated,
  getUsers,
  findUser,
  validateUserData,
  findUserById,
  getUserById,
  validateLoginData,
};
