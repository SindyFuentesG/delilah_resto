const { path } = require("./config");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(path);

module.exports = { sequelize };
