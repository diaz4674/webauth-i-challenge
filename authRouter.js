const knex = require('knex');
const router = require('express').Router();
const bcrypt = require('bcryptjs');

const dbConfig = require('./knexfile.js')
const db = knex(dbConfig.development);

router.get('/', (req, res) => {
    res.send("Let's git'er done!")
})

module.exports = router;