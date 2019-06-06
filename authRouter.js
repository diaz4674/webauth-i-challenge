const knex = require('knex');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const session = require('express-session')
const dbConfig = require('./knexfile.js')
const db = knex(dbConfig.development);
const Users = require('./users/users-model.js')

const sessionConfig = {
    //Cookie boilerplating
    name: 'Batman', 
    secret: 'keep it secret, keep it safe',
    cookie: {
        maxAge: 1000 * 30,
        secure: false, //true in production,
        httpOnly: true,
    },
    resave: false, 
    saveUninitialized: false, //GDPR laws against setting cookies automatically
}

router.use(session(sessionConfig))

router.get('/', (req, res) => {
    res.send("Let's git'er done!")
})

router.post('/api/register', (req, res) => {
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
})

function authorize(req, res, next) {
    let {username, password} = req.body;
    if(!username && !password){
        return res.status(401).json({message: 'Invalid Street Creds'})
    }

    if(req.session && req.session.user){
            next()
        } else {
            res.status(401).json({message: 'Thou shall not pass!'})
    }
        

}

router.get('/api/users', authorize, (req, res) => {
    Users.find()
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err))
})


module.exports = router;