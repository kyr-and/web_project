const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Har = require('./Har');

const User = db.define('User', {
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
},{
    tableName: 'user'
});

User.Har = User.hasMany(Har, {as: 'Har', foreignKey: 'user_id'});

module.exports = User