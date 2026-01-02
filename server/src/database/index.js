const { pool } = require('./connection');

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
