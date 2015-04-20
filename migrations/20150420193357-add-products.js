var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('products', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: 'string',
      length: 255,
      notNull: true,
      unique: true
    },
    description: {
      type: 'text'
    },
    price: {
      type: 'decimal',
      notNull: true
    },
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('products', callback);
};