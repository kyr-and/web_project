const Response = require('../models/Response');
const Har = require('../models/Har');
const Entry = require('../models/Entry');
const { Op } = require('sequelize');
const moment = require('moment');

async function getHistogramInformation(options) {
    let restrictions = getRestrictions(options);

    let histogram_info = await Har.findAll({
        attributes: [
            'Entry->Response->Headers.content_type',
            'Entry->Response->Headers.cache_control',
            'Entry->Response->Headers.expires',
            'Entry.startedDateTime'
        ],
        include: [{
            association: Har.Entry,
            attributes: [],
            required: true,
            include: [{
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
        where: {
            ...restrictions,
            '$cache_control$': {
                [Op.ne]: null
            }
        },
        raw: true
    });

    let processed_histogram_info = processHistogramInfo(histogram_info);
    return processed_histogram_info;
}

async function getCacheabilityPercentage(options) {
    let restrictions = getRestrictions(options);

    let cacheability_info = await Har.findAll({
        attributes: [
            'Entry->Response->Headers.content_type',
            'Entry->Response->Headers.cache_control'
        ],
        include: [{
            association: Har.Entry,
            attributes: [],
            required: true,
            include: [{
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
        where: {
            ...restrictions,
            '$cache_control$': {
                [Op.ne]: null
            }
        },
        raw: true
    });

    let num_responses = await Response.count();

    let processed_cacheability_info = {
        num_responses,
        info: processCacheabilityInfo(cacheability_info)
    };
    return processed_cacheability_info;
}

function getRestrictions(options) {
    let where_restrictions = {};

    // Create sequelize restrictions
    for(const [key, value] of Object.entries(options)) {
        if (!value) {
            continue;
        }
        else {
            let condition_col = `$${key}$`;
            let condition_val = value.split(';');

            where_restrictions[condition_col] = {
                [Op.or]: condition_val
            };
        }
    }

    return where_restrictions;
}

function processHistogramInfo(infos) {
    let ttls = [];

    infos.forEach(info => {
        let content_type_idx = ttls.findIndex((obj => obj.content_type == info.content_type));
        if (content_type_idx !== -1) {
            let ttl = calculateTTL(info)
            ttls[content_type_idx].ttl.push(ttl);
        }
        else {
            let ttl = calculateTTL(info);
            ttls.push({
                content_type: info.content_type,
                ttl: [ttl]
            });
        }
    });

    return ttls;
}

function calculateTTL(info) {
    // Check if max-age directive exists
    const regex = /max-age=[0-9]*/g;
    const max_age_directive = info.cache_control.match(regex);
    let ttl;

    if (max_age_directive) {
        // Get num of max-age directive
        ttl = parseInt(max_age_directive[0].split('=')[1]);
    }
    else {
        // If header has an expires column calculate ttl
        if (info.expires) {
            let responseDate = moment(info.startedDateTime);
            let expiresDate = moment(new Date(info.expires));
            ttl = parseFloat(expiresDate.diff(responseDate, 'seconds', true).toFixed(2));
        }
        else {
            ttl = 0;
        }
    }

    return ttl;
}

function processCacheabilityInfo(infos) {
    let result = [];

    infos.forEach(info => {
        // Skip iteration if cache_control is null
        if (!info.cache_control) {
            return;
        }

        let content_type_idx = result.findIndex((obj => obj.content_type == info.content_type));
        if (content_type_idx !== -1) {
            let cacheability_directives = findCacheabilityDirectives(info.cache_control);
            result[content_type_idx].cacheability_directives.push(...cacheability_directives);
        }
        else {
            let cacheability_directives = findCacheabilityDirectives(info.cache_control);
            result.push({
                content_type: info.content_type,
                cacheability_directives
            });
        }
    });

    let cacheability_percentages = calculateCacheabilityCount(result);
    return cacheability_percentages;
}

function findCacheabilityDirectives(cache_control) {
    // We use /g in regex to find matches in the whole string
    const regex = /public|private|no-cache|no-store/g;
    let directives = cache_control.match(regex);

    if (directives) {
        return directives;
    }
    else {
        return [null];
    }
}

function calculateCacheabilityCount(cacheability_array) {
    let result = [];
    cacheability_array.forEach(cache_obj => {
        let count_obj = {};

        cache_obj.cacheability_directives.forEach(directive => {
            // We want directive to be not null
            if (directive) {
                count_obj[directive] = count_obj[directive] ? count_obj[directive] + 1 : 1; 
            }  
        });
        
        result.push({
            content_type: cache_obj.content_type,
            cacheability_directives: count_obj
        })
    });

    return result;
}

module.exports = { getHistogramInformation, getCacheabilityPercentage }