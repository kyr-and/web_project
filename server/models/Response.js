const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Header = require('./Header');

const Response = db.define('Response', {
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.STRING
    },
    statusText: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'response',
    timestamps: false
});


Response.Header = Response.belongsTo(Header, {as: 'Headers', foreignKey: 'header_id'});

module.exports = Response