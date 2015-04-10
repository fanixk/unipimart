var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('users', {
    id: {
      type: 'int',
      primaryKey: true,
      unsigned: true,
      notNull: true
    },
    email: {
      type: 'string',
      length: 255,
      notNull: true,
      unique: true
    },
    password_digest: {
      type: 'binary',
      length: 60,
      notNull: true
    },
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('users', callback);
};