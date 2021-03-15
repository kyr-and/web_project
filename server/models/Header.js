const { DataTypes } = require('sequelize');
const db = require('../config/database')

const Header = db.define('Header', {
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    content_type: {
        type: DataTypes.STRING
    },
    cache_control: {
        type: DataTypes.STRING
    },
    pragma: {
        type: DataTypes.STRING
    },
    expires: {
        type: DataTypes.STRING
    },
    age: {
        type: DataTypes.STRING
    },
    last_modified: {
        type: DataTypes.STRING
    },
    host: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'header',
    timestamps: false
});

module.exports = Header