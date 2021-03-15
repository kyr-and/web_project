const { saveToDB } = require('./uploadController');
const { getCreationDate, getProfile, validateProfile, updateUser, getLeaderboard } = require('./profileController');
const { getMapData } = require('./mapController');

exports.sendCreationDate = (req, res) => {
    let user_id = req.user.id;
    getCreationDate(user_id)
        .then(date => {
            res.send(date);
        });
};

exports.upload = (req, res) => {
    let data = JSON.parse(req.body.data);
    
    if (data.processed) {
        saveToDB(data, req.user.id)
            .then( info => {
                res.send('');
            });  
    }
    else {
        res.send('Data was not processed.');
    }
};

exports.updateProfile = (req, res) => {
    let new_profile_info = req.body;
    let current_username = req.user.username;
    
    validateProfile(new_profile_info, current_username)
        .then(validationErrors => {
            if (validationErrors.length === 0) {
                let current_user_id = req.user.id;
                updateUser(new_profile_info, current_user_id);
            }
            res.send(validationErrors);
        });
};

exports.sendProfile = (req, res) => {
    let user_id = req.user.id;
    getProfile(user_id)
        .then(data => {
            res.send(data);
        });
};

exports.sendLeaderboard = (req, res) => {
    getLeaderboard()
        .then(data => {
            data.curr_user = req.user.username;
            res.send(data);
        });
};

exports.sendMapData = (req, res) => {
    let user_id = req.user.id;
    getMapData(user_id)
        .then(data => {
            res.send(data);
        });
};