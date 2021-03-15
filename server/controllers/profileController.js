const db = require('../config/database');
const Har = require('../models/Har');
const User = require('../models/User');
const { includesCapitalLetter, includesNumber, includesSymbol } = require('./passwordValidation');
const bcrypt = require('bcryptjs');

// Creation Date
async function getCreationDate(userID) {
    let result = await User.findByPk(userID, {
        attributes: [
            'createdAt'
        ],
        raw: true
    });

    return result;
}

// Profile Info
async function getProfile(userID) {
    let num_upload = await Har.count({
        where: {
            'user_id': userID
        }
    });

    let num_entries = await Har.count({
        where: {
            'user_id': userID
        },
        include: [{
            association: Har.Entry
        }]
    });

    let user_info = await User.findByPk(userID, {
        attributes: [
            'username',
            'email'
        ],
        include: [{
            association: User.Har,
            attributes: [
                [db.fn('max', db.col('uploadDate')), 'last_upload']
            ],
        }],
        group: 'Har.id',
        raw: true
    });

    user_info.last_upload = user_info['Har.last_upload'];
    delete user_info['Har.last_upload'];

    let profile_info = {
        num_upload, 
        num_entries,
        ...user_info
    }

    return profile_info;
}

// Update User
async function updateUser(new_profile_info, user_id) {
    const curr_user = await User.findByPk(user_id);

    let { username, password } = new_profile_info;
    curr_user.username = username;

    if (password != '') {
        // Hashing Password
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds)
            .then(hash => {
                curr_user.password = hash;
                curr_user.save();
            });
    }
    else {
        curr_user.save();
    }
}

// Leaderboard Info
async function getLeaderboard() {
    let leaderboard = await User.findAll({
        attributes: [
            'username',
            [db.fn('COUNT', db.col('Har->Entry.id')), 'num_entries']
        ],
        include: [{
            association: User.Har,
            include: [{
                association: Har.Entry,
                attributes: []
            }],
            attributes: []
        }],
        raw: true,
        group: 'User.id',
        order: db.literal('num_entries DESC')
    });

    let leaderboard_info = {
        leaderboard
    }

    return leaderboard_info;
}

// Profile Validation
async function validateProfile(input, current_username) {
    let { username, password, password2 } = input;
    let errors = [];

    if (username != current_username) {
        const userExists = await User.findOne({ where: { username: username }});
        if (userExists) {
            errors.push({ msg: 'Username already exists.' });
            return errors;
        }
    }

    if (!(password == '' && password2 == '')) {
        if (password.length < 8 || !includesCapitalLetter(password) || !includesNumber(password) || !includesSymbol(password)) {
            errors.push({ msg: 'Password should be at least 8 characters long and contain a capital letter, a number and a symbol.'});
        }
        if (password !== password2) {
            errors.push({ msg: 'Passwords should match.'});
        }
    }

    return errors;
}

module.exports = { getProfile, validateProfile, updateUser, getLeaderboard, getCreationDate }