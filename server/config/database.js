const { Sequelize } = require('sequelize');

module.exports = new Sequelize('har_db', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});