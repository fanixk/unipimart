var config = require('./database.json'),
  env = process.env.NODE_ENV || 'development',
  host = config[env].host,
  driver = config[env].driver,
  db = config[env].database,
  dbUsername = config[env].user,
  dbPass = config[env].password;

var sequelize = new Sequelize(db, dbUsername, dbPass, {
  host: host,
  dialect: driver
});

module.exports = sequelize;