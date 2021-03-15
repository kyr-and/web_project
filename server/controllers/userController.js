const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { includesCapitalLetter, includesNumber, includesSymbol } = require('./passwordValidation');

exports.save = (req, res) => {
    validate(req.body)
        .then(validationErrors => {
            if (validationErrors.length === 0) {
                createUser(req.body);
            }
            res.send(validationErrors);
        }); 
}

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.send(false); }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            return res.send(true);
        });
  })(req, res, next);
}

// Validation
async function validate(input) {
    let { username, email, password, password2 } = input;
    let errors = [];

    if (!username || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields.'});
        return errors;
    }

    const userExists = await User.findOne({ where: { username: username }});
    if (userExists) {
        errors.push({ msg: 'Username already exists.' });
        return errors;
    }

    const emailExists = await User.findOne({ where: { email: email }});
    if (emailExists) {
        errors.push({ msg: 'Email is already registered.' });
        return errors;
    }

    if (password.length < 8 || !includesCapitalLetter(password) || !includesNumber(password) || !includesSymbol(password)) {
        errors.push({ msg: 'Password should be at least 8 characters long and contain a capital letter, a number and a symbol.'});
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords should match.'});
    }

    return errors;
}

// Insert User into Database
function createUser(input) {
    let { username, email, password } = input;

    // Hashing Password
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds)
        .then(hash => {
            const newUser = {
                username,
                email,
                password: hash
            }

            User.create(newUser)
                .then(user => console.log('User added...\n'))
                .catch(err => console.log(err));
        })
}