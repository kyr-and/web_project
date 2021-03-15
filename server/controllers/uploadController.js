const Har = require('../models/Har');
const Response = require('../models/Response');
const Request = require('../models/Request');
const Entry = require('../models/Entry');

async function saveToDB(data, userID) {
    // First create the Har id so that each entry can use it
    let har_id = await createHar(userID, data.ip_info);

    let entries = data.entries;
    let entries_bulk = entriesBulk(entries, har_id);

    Entry.bulkCreate(entries_bulk, {
        include: [{
            association: Entry.Request,
            include: [ Request.Header ]
        }, {
            association: Entry.Response,
            include: [ Response.Header ]
        }]
    }).then(() => { return []});
}

async function createHar(userID, ip_info) {
    let isp = ip_info.isp;

    newHar = await Har.create({
        user_id: userID,
        uploadISP: isp
    });
    return newHar.id;
}

// Create array of entries to utilize bulk insert
function entriesBulk(entries, har_id) {
    let entries_bulk = [];
    
    entries.forEach(entry => {
        let new_entry = {
            har_id,
            startedDateTime: entry.startedDateTime,
            serverIPAddress: entry.serverIPAddress,
            timings_wait: entry.timings_wait,
            Request: createRequest(entry.request),
            Response: createResponse(entry.response)
        }
        entries_bulk.push(new_entry);
    });

    return entries_bulk;
}

function createRequest(request) {
    let newRequest;

    if (emptyHeaders(request.headers)) {
        newRequest = {
            method: request.method,
            domain_url: request.url,
            header_id: null
        };
    }
    else {
        newRequest = {
            method: request.method,
            domain_url: request.url,
            Headers: createHeaders(request.headers)
        };
    }
    
    return newRequest;
}

function createResponse(response) {
    let newResponse;

    if (emptyHeaders(response.headers)) {
        newResponse = {
            status: response.status,
            statusText: response.statusText,
            header_id: null
        };
    }
    else {
        newResponse = {
            status: response.status,
            statusText: response.statusText,
            Headers: createHeaders(response.headers)
        };
    }
    
    return newResponse;
}

function createHeaders(headers) {
    let newHeaders = {
        content_type: headers.content_type,
        cache_control: headers.cache_control,
        pragma: headers.pragma,
        expires: headers.expires,
        age: headers.age,
        last_modified: headers.last_modified,
        host: headers.host
    }

    return newHeaders;
}

function emptyHeaders(headers) {
    let values = Object.values(headers)
    return values.every(value => value === null );
}

module.exports = { saveToDB };