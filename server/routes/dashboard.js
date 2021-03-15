const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAuthenticatedAdmin } = require('../config/auth');
const path = require('path');
const fs = require('fs');

// Paths to views for user and admin
const user_dashboard_path = path.join(__dirname, '../views/user_dashboard/');
const user_dashboard_root = { root: user_dashboard_path };
const admin_dashboard_path = path.join(__dirname, '../views/admin_dashboard/');
const admin_dashboard_root = { root: admin_dashboard_path };


// Routes
router.get('/', ensureAuthenticated, (req, res) => {
    let userRole = req.user.role;
    if (userRole > 1) {
        res.render('adminDashboard');
    }
    else {
        res.render('userDashboard', { name: req.user.username });
    } 
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/users/login');
});

router.get('/:page', ensureAuthenticated, (req, res) => {
    let page = req.params.page;
    let userRole = req.user.role;
    let dashboard_path;
    let dashboard_root;

    if (userRole > 1) {
        dashboard_path = admin_dashboard_path;
        dashboard_root = admin_dashboard_root;
    }
    else {
        dashboard_path = user_dashboard_path;
        dashboard_root = user_dashboard_root;
    }

    let page_path = path.join(dashboard_path, `${page}.html`);
    if (fs.existsSync(page_path)) {
        res.sendFile(`${page}.html`, dashboard_root);
    }
    else {
        res.sendFile('error.html', dashboard_root);
    }
});


// API Handling User Dashboard
const userDashboard = require('../controllers/userDashboardController');
router.post('/api/upload', ensureAuthenticated, userDashboard.upload);
router.post('/api/update', ensureAuthenticated, userDashboard.updateProfile);

router.get('/api/home', ensureAuthenticated, userDashboard.sendCreationDate)
router.get('/api/profile', ensureAuthenticated, userDashboard.sendProfile);
router.get('/api/leaderboard', ensureAuthenticated, userDashboard.sendLeaderboard);
router.get('/api/mapData', ensureAuthenticated, userDashboard.sendMapData);


// API Handling Admin Dashboard
const adminDashboard = require('../controllers/adminDashboardController');
router.get('/api/basicInformation', ensureAuthenticatedAdmin, adminDashboard.sendBasicInformation);
router.get('/api/timingsInformation', ensureAuthenticatedAdmin, adminDashboard.sendTimingsInformation);
router.get('/api/histogram', ensureAuthenticatedAdmin, adminDashboard.sendHistogramInformation);
router.get('/api/cacheability', ensureAuthenticatedAdmin, adminDashboard.sendCacheabilityPercentage);
router.get('/api/adminMapData', ensureAuthenticatedAdmin, adminDashboard.sendAdminMapData);
router.get('/api/selections', ensureAuthenticatedAdmin, adminDashboard.sendSelections);

module.exports = router;