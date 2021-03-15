const { getBasicInformation } = require('./basicInformationController');
const { getTimingsInformation, getSelections } = require('./timingsInformationController');
const { getHistogramInformation, getCacheabilityPercentage } = require('./headersInformationController');
const { getMapData, processAdminMapInfo } = require('./mapController');

exports.sendBasicInformation = (req, res) => {
    getBasicInformation()
        .then( info => {
            res.send(info);
        });
}

exports.sendTimingsInformation = (req, res) => {
    let options = {
        content_type: req.query.content_type,
        day: req.query.day,
        method: req.query.method,
        uploadISP: req.query.isp
    }

    getTimingsInformation(options)
        .then( info => {
            res.send(info);
        });
}

exports.sendHistogramInformation = (req, res) => {
    let options = {
        content_type: req.query.content_type,
        uploadISP: req.query.isp
    }

    getHistogramInformation(options)
        .then( info => {
            res.send(info);
        });
}

exports.sendCacheabilityPercentage = (req, res) => {
    let options = {
        content_type: req.query.content_type,
        uploadISP: req.query.isp
    }

    console.log(options);
    getCacheabilityPercentage(options)
        .then( info => {
            res.send(info);
        });
}

exports.sendAdminMapData = (req, res) => {
    getMapData()
        .then( map_info => {
            let info = processAdminMapInfo(map_info.data);
            res.send(info);
        });
}

exports.sendSelections = (req, res) => {
    getSelections()
        .then( info => {
            res.send(info);
        });
}