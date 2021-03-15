const User = require('../models/User');
const Request = require('../models/Request');
const Response = require('../models/Response');
const Har = require('../models/Har');
const Entry = require('../models/Entry');
const { Op } = require('sequelize');
const moment = require('moment');

async function getBasicInformation() {
    let user_count = await User.count({
        where: {
            'role' : {[Op.eq]: 1}
        },
        raw: true
    });

    let requests_per_method = await getRequestsPerMethod();
    let responses_per_status = await getResponsesPerStatus();

    let domain_count = await Request.count({
        distinct: true,
        col: 'domain_url',
        raw: true
    });

    let isp_count = await Har.count({
        distinct: true,
        col: 'uploadISP',
        raw: true
    });

    let content_lifespan = await getContentLifespan();

    return { 
        user_count,
        requests_per_method,
        responses_per_status,
        domain_count,
        isp_count,
        content_lifespan
    }
}

async function getRequestsPerMethod() {
    let counts = await Request.count({
        attributes: [
            'method'
        ],
        col: 'method',
        group: 'method'
    });

    return counts;
}

async function getResponsesPerStatus() {
    let counts = await Response.count({
        attributes: [
            'status'
        ],
        where: {
            'status': {[Op.ne]: 0}
        },
        col: 'status',
        group: 'status'
    });

    return counts;
}

async function getContentLifespan() {
    let dates = await Entry.findAll({
        attributes: [
            'startedDateTime',
            'Response->Headers.content_type',
            'Response->Headers.last_modified'
        ],
        include: [{
            association: Entry.Response,
            attributes: [],
            required: true,
            include: [{
                association: Response.Header,
                attributes: [],
                required: true
            }]
        }],
        where: {
            '$Response->Headers.last_modified$': {[Op.ne]: null}
        },
        raw: true
    });

    processed_dates = processDates(dates);

    return processed_dates;
}

function processDates(dates) {
    // Array of objects. Each object contains the content type and its lifespan
    let result = [];

    dates.forEach(date => {
        // Lifespan = last_modified - startedDateTime (measured in hours)
        let responseDate = moment(date.startedDateTime);
        let createdDate = moment(date.last_modified);
        let lifespan = responseDate.diff(createdDate, 'hours', true);

        // Check if object with content type name already exists and add the lifespan number
        // Else create a new object
        let content_type_idx = result.findIndex((obj => obj.content_type == date.content_type));
        if (content_type_idx !== -1) {   
            result[content_type_idx].lifespan.push(lifespan);
        }
        else {
            result.push({
                content_type: date.content_type,
                lifespan: [lifespan]
            });
        }
    });

    // Calculate the average lifespan
    result.forEach(obj => {
        let sum = obj.lifespan.reduce((a, b) => a + b, 0);
        let avg = (sum / obj.lifespan.length);
        obj.lifespan = avg.toFixed(2);
    });

    return result;
}

module.exports = { getBasicInformation }