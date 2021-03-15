const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

const app = express();

// Bodyparser
app.use(express.urlencoded({
    extended: false,
    limit: '50mb'
}));

// Passport
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Strategy
require('./server/config/passport')(passport);

// Database Connection
const db = require('./server/config/database')
db.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.log('Error: ' + err))

// Routes
app.use('/', require('./server/routes/index'));
app.use('/users', require('./server/routes/users'));
app.use('/dashboard', require('./server/routes/dashboard'));

// Views
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));


app.listen(3000, () => console.log('Server started on port 3000'));