var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

// TODO: add foreign key constraints
exports.up = function(db, callback) {
  db.createTable('orders', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    price: {
      type: 'decimal',
      unsigned: true,
      allowNull: false
    },
    street_name: {
      type: 'string',
      notNull: true
    },
    street_num: {
      type: 'string',
      notNull: true,
    },
    zipcode: {
      type: 'string',
      notNull: true
    },
    user_id: {
      type: 'int',
      notNull: true
    }
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('orders', callback);
};
