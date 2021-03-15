const { DataTypes } = require('sequelize');
const db = require('../config/database')
const Request = require('./Request');
const Response = require('./Response');

const Entry = db.define('Entry', {
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    startedDateTime: {
        type: DataTypes.DATE
    },
    serverIPAddress: {
        type: DataTypes.STRING
    },
    timings_wait: {
        type: DataTypes.DOUBLE
    }
}, {
    tableName: 'entry',
    timestamps: false
});

Entry.Request = Entry.hasOne(Request, {as: 'Request', foreignKey: 'entry_id'});
Entry.Response = Entry.hasOne(Response, {as: 'Response', foreignKey: 'entry_id'});

module.exports = Entry