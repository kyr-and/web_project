const User = require('../models/User');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

module.exports = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
      // Match user
      User.findOne({ where: { username: username }})
        .then(user => {
            if (!user) {
                return done(null, false);
            }

            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } 
                else {
                    return done(null, false);
                }
            });
        });
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findByPk(id)
            .then(user => {
                done(null, user);
        });
    });
}