const express = require('express');
const morgan = require('morgan');
const router = require('./routes/index');
// eslint-disable-next-line no-unused-vars
const db = require('../database/connection');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use('', router);

module.exports = app;
