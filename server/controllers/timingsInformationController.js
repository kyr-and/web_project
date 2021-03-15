const Entry = require('../models/Entry');
const Response = require('../models/Response');
const Request = require('../models/Request');
const Har = require('../models/Har');
const Header = require('../models/Header');
const { Op } = require('sequelize');
const db = require('../config/database');

async function getSelections() {
    let content_types = await Header.findAll({
        attributes: [
            [db.fn('DISTINCT', db.col('content_type')), 'content_type']
        ],
        raw: true
    });

    let methods = await Request.findAll({
        attributes: [
            [db.fn('DISTINCT', db.col('method')), 'method']
        ],
        raw: true
    });

    let isps = await Har.findAll({
        attributes: [
            [db.fn('DISTINCT', db.col('uploadISP')), 'isp']
        ],
        raw: true
    });

    let selections = {
        content_types,
        methods,
        isps
    }

    return selections;
}

async function getTimingsInformation(options) {
    let restrictions = getRestrictions(options);
    let result = await Har.findAll({
        attributes: [
            'Entry.timings_wait',
            'Entry.startedDateTime'
        ],
        include: [{
            association: Har.Entry,
            attributes: [],
            required: true,
            include: [{
                association: Entry.Request,
                attributes: [],
                required: true
            }, {
                association: Entry.Response,
                attributes: [],
                required: true,
                include: [{
                    association: Response.Header,
                    attributes: [],
                    required: true
                }]
            }]
        }],
        where: restrictions,
        raw: true
    });

    let timings = result.map(obj => {
        let date = new Date(obj.startedDateTime);
        let time = date.getHours();
        // console.log(`date: ${date} ----> time: ${time}`); new Date() changes timezone for some reason
        return {
            wait: obj.timings_wait,
            time
        }
    });

    let processed_timings = processTimings(timings);
    return processed_timings;
}

function getRestrictions(options) {
    let where_restrictions = {};

    for(const [key, value] of Object.entries(options)) {
        if (!value) {
            continue;
        }
        else {
            if (key === 'day') {
                let day_where_cluase = createDayCondition(value);
                where_restrictions = {...where_restrictions, ...day_where_cluase}
            }
            else {
                let condition_col = `$${key}$`;
                let condition_val = value.split(';');
                where_restrictions[condition_col] = {
                    [Op.or]: condition_val
                };
            }
        }
    }

    return where_restrictions;
}

function createDayCondition(cond) {
    let days = cond.split(';');

    // DAYNAME() gets the name of the day from a date format
    let where_condition = {
        [Op.and]: [db.where(db.fn('DAYNAME', db.col('Entry.startedDateTime')), {[Op.or]: days})]
    }
    return where_condition;
}

function processTimings(timings) {
    let result = [];

    timings.forEach(timing => {
        let time_idx = result.findIndex((obj => obj.time == timing.time));
        if (time_idx !== -1) {   
            result[time_idx].wait.push(timing.wait);
        }
        else {
            result.push({
                time: timing.time,
                wait: [timing.wait]
            });
        }
    });

    let timings_avg = findAverageTimings(result);

    return timings_avg;
}

function findAverageTimings(timings) {
    return timings.map(timing => {
        let avg_wait = timing.wait.reduce((a, b) => a + b) / timing.wait.length;
        return {
            time: timing.time,
            avg_wait: parseFloat(avg_wait.toFixed(2))
        }
    });
}

module.exports = { getTimingsInformation, getSelections }