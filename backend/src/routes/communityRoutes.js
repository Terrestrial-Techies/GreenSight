const express = require('express');
const router = express.Router();
const { getPosts, postNew } = require('../controllers/communityController');

router.get('/', getPosts);
router.post('/', postNew);

module.exports = router;
