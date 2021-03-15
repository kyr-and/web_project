const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Entry = require('./Entry');

const Har = db.define('Har', {
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    uploadDate: {
        type: 'TIMESTAMP'
    },
    uploadISP: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'har',
    timestamps: false
});

Har.Entry = Har.hasMany(Entry, {as: 'Entry', foreignKey: 'har_id'})

module.exports = Har