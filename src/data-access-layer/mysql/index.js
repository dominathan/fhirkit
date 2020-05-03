const mysql = require('mysql')
const databaseConfig = require('../../../config/database/mysql.config')

const poolAndDatabase = Object.assign({}, databaseConfig, { connectionLimit: 4 })

const pool = mysql.createPool(poolAndDatabase)

module.exports = pool
