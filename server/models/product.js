var products = [
  { id: 1, title: "Product1", price: 10},
  { id: 2, title: "Product2", price: 20},
  { id: 3, title: "Product3", price: 30},
  { id: 4, title: "Product4", price: 40}
]

module.exports = {
  list: function(req, res) {
    res.json(products);
  }
}