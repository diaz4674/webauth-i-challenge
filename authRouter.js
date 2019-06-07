const express = require('express');
const knex = require('knex');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const session = require('express-session')
const dbConfig = require('./knexfile.js')
const db = knex(dbConfig.development);
const Users = require('./users/users-model.js')
const SessionStore = require('connect-session-knex')(session);
const restricted = require('./restricted-middleware');

const sessionConfig = {
    //Cookie boilerplating
    name: 'Batman', 
    secret: 'keep it secret, keep it safe',
    cookie: {
        maxAge: 60 * 60 * 1000,
        secure: false, //true in production,
        httpOnly: true,
    },
    resave: false, 
    saveUninitialized: false, //GDPR laws against setting cookies automatically
    store: new SessionStore({
        knex: require('./data/dbConfig'),
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 60 * 60 * 1000,
      }),
}

router.use(session(sessionConfig))
router.use(express.json())

router.get('/', (req, res) => {
    res.send("Let's git'er done!")
})

router.post('/api/register',  (req, res) => {
    let user = req.body;

        const hash = bcrypt.hashSync(user.password, 12);
        user.password = hash
    Users.add(user)
        .then(saved => {
            res.status(201).json(saved);
        })
        .catch(err => {
            res.status(500).json(err)
        })
})

router.post('/api/login', (req, res) => {
    let {username, password} = req.body

    Users.findBy({username})
        .first()
        .then(user => {
            if(user && bcrypt.compareSync(password, user.password)){
                req.session.user = user;
                res.status(200).json({message: `Welcome ${user.username}!`})
            } else {
                res.status(401).json({message: 'Invalid creds'})
            }
        })
        .catch(error => {
            res.status(500).json(error);
          });
})

router.get('/api/users', restricted, (req, res) => {
    Users.find()
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err))
})

router.get('/api/logout', (req,res) => {
    if(req.session && req.session.user) {
        req.session.destroy(err => {
            if(err){
                res.json({message: 'could not log you out.'})
            } else {
                res.status(200).json({message:"Successfully logged out."})
            }
        })
    } else {
        res.status(200).json({message: 'you were never here.'})
    }
})

module.exports = router;