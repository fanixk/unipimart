var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('line_items', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: 'int',
      notNull: true,
      unsigned: true
    },
    order_id: {
      type: 'int',
      unsigned: true
    },
    quantity: {
      type: 'int',
      unsigned: true,
      notNull: true,
      defaultValue: 1
    },
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('line_items', callback);
};
