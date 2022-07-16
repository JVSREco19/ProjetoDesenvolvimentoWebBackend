'use strict';

const dotenv = require('dotenv');

dotenv.config();

const {
    PORT,
    pgConnection
} = process.env;

module.exports = {
   urlConnection:pgConnection,
   port:PORT
}

