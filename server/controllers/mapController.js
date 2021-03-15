const User = require('../models/User');
const Har = require('../models/Har');
const Entry = require('../models/Entry');
const Response = require('../models/Response');
const { Op } = require("sequelize");
var geoip = require('geoip-lite');

async function getMapData(userID = null) {
    let idRestriction = (userID) ? {'id': userID} : {};

    let entries = await User.findAll({
        attributes: [
            'Har->Entry.serverIPAddress',
            ['id', 'user_id']
        ],
        include: [{
            association: User.Har,
            attributes: [],
            required: true,
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
            }]
        }],
        where: {
            ...idRestriction,
            'role': {
                [Op.eq] : 1
            },
            '$Har->Entry->Request.method$': 'GET',
            '$Har->Entry->Response->Headers.content_type$': {
                [Op.like]: '%text/html%'
            }
        },
        raw: true
    });

    let processed_data = processIPs(entries);

    // Finding the max from an array => Math.max(...array)
    let map_data = {
        max: Math.max(...processed_data.map(obj => obj.count)),
        data: processed_data
    }

    return map_data;
}

function processIPs(entries) {
    let data = [];

    entries.forEach(entry=> {
        let ip = entry.serverIPAddress.replace(/\[|\]/g, ''); // remove brackets from the IPv6
        let geo = geoip.lookup(ip);
        
        let alreadyExists = (geo) ? dataExists(entry.user_id, data, geo.ll) : true;
        if (!alreadyExists) {
            let new_data = {
                user_id: entry.user_id,
                lat: geo.ll[0],
                lng: geo.ll[1],
                count: 1
            }
            data.push(new_data);
        }
    });

    return data;
}

function dataExists(user_id, data, new_data_arr) {
    const result = data.find(obj => {
        if (obj.lat === new_data_arr[0] && obj.lng === new_data_arr[1] && obj.user_id === user_id) return true;
    });

    // JS objects are passed by reference so we can update count here
    if (result) {
        result.count += 1;
        return true;
    }
    else {
        return false;
    }
}

function processAdminMapInfo(data) {
    let result = [];

    data.forEach(entry => {
        let idx = result.findIndex((obj => obj.user_id == entry.user_id));
        let new_entry = {
            lat: entry.lat,
            lng: entry.lng,
            count: entry.count
        }

        if (idx !== -1) {
            result[idx].ip_requests.push(new_entry);
        }
        else {
            result.push({
                user_id: entry.user_id,
                ip_requests: [new_entry]
            })
        }
    });

    let final_result = {
        usersData: result,
        maxCount: findMaxRequestsCount(result)
    };
    return final_result;
}

function findMaxRequestsCount(mapData) {
    return mapData.reduce( (prev, current) => {
        let prevMaxRequestCount = (prev.ip_requests) ? findRequestsArrayMax(prev.ip_requests) : 0;
        let currMaxRequestCount = (current.ip_requests) ? findRequestsArrayMax(current.ip_requests) : 0;
        return (prevMaxRequestCount > currMaxRequestCount) ? prevMaxRequestCount : currMaxRequestCount
    });
}

function findRequestsArrayMax(requests) {
    return Math.max(...requests.map(request => request.count));
}

module.exports = { getMapData, processAdminMapInfo }