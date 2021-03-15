const express = require('express');
const router = express.Router();

// Serving Pages
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

// API Handling
const users = require('../controllers/userController');
router.post('/api/save', users.save);
router.post('/api/login', users.login);

module.exports = router;