const { DataTypes } = require('sequelize');
const db = require('../config/database')
const Header = require('./Header');

const Request = db.define('Request', {
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    method: {
        type: DataTypes.STRING
    },
    domain_url: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'request',
    timestamps: false
});

Request.Header = Request.belongsTo(Header, {as: 'Headers', foreignKey: 'header_id'});

module.exports = Request