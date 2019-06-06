const express = require('express');
const server = (express());

const authRouter = require('./authRouter.js')

server.use(express.json())

server.use('/', authRouter);

module.exports = server;