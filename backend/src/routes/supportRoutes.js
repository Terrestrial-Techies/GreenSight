const express = require('express');
const router = express.Router();
const { getTickets, postTicket } = require('../controllers/supportController');

router.get('/', getTickets);
router.post('/', postTicket);

module.exports = router;
