// Container for Products
function Product(productDetails) {
  var self = this;
  var _code, _name, _price;
  /**
   * Initialise Product
   * @param productDetails
   */
  function _init(prodDets) {
    _code = prodDets.productCode;
    _name = prodDets.productName;
    _price = prodDets.price;
  }
  /**
   * Update this product
   * @param update
   */
  this.update = function(update) {
    if ((update.productCode || '').trim()) {
      _code = update.productCode.trim();
    }
    if ((update.productName || '').trim()) {
      _name = update.productName.trim();
    }
  }
  /**
   * Get Product Code
   * @returns string
   */
  this.getProductCode = function() {
    return _code;
  }
  /**
   * Get Product Name
   * @returns string
   */
  this.getProductName = function() {
    return _name;
  }
  /**
   * Get Product Price
   * @returns string
   */
  this.getProductPrice = function() {
    return _price;
  }
  _init(productDetails);
}

/**
 * Checks if JSON is a valid Product constructor parameter
 * @param product
 * @returns bool
 */
Product.isJsonValid = function(product = {}) {
  return (product.productCode || '').trim()
    && (product.productName || '').trim()
    && product.price !== null
    && product.price !== undefined
    && !isNaN(product.price);
}
