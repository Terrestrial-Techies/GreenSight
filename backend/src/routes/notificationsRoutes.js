const express = require('express');
const router = express.Router();
const { getNotifications, postNotification } = require('../controllers/notificationsController');

router.get('/', getNotifications);
router.post('/', postNotification);

module.exports = router;
