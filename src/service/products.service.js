// Singleton
// Will be managing our product list
// Alter the array passed onto the Class Constructor to update products
// Define methods to alter products on the fly.
const ProductService = new (function(productInitialisers) {
  const self = this;
  const _availableProducts = [];
  /**
   * Adds a Product
   * @param prod
   * @returns Product?
   */
  this.addProduct = (prod) => {
    if(Product.isJsonValid(prod)) {
      if (!self.getProduct(prod.productCode)) {
        _availableProducts.push(new Product(prod));
        return _availableProducts[_availableProducts.length - 1];
      }
    }
    return null;
  };
  /**
   * Gets a Product with the given product code
   * @param prodCode string
   * @returns Product?
   */
  this.getProduct = (prodCode) => {
    const foundProducts = _availableProducts.filter(prod => {
      return prodCode === prod.getProductCode();
    });
    // console.log('found product', prodCode, (foundProducts || []).length > 0 ? foundProducts[0] : null);
    return (foundProducts || []).length > 0 ? foundProducts[0] : null;
  };
  /**
   * Gets the list of all products
   * @returns [Product]
   */
  this.getProducts = () => {
    return _availableProducts;
  };
  /**
   * Gets list of product codes by value
   * @returns [string]
   */
  this.getProductCodesByValue = () => {
    const prodCodes = [];
    _availableProducts
      .sort((prodA, prodB) => {
        return prodA.getProductPrice() - prodB.getProductPrice();
      })
      .forEach(product => {
        prodCodes.push(product.getProductCode());
      });
    return prodCodes;
  };
  /**
   * Checks if a product code has not been utilised / assigned yet
   * @param prodCode
   * @returns bool
   */
  this.isProductCodeAvailable = (prodCode) => {
    return _availableProducts.filter(prod => {
      return prodCode === prod.getProductCode();
    }).length > 0;
  };
  // initialise available products
  productInitialisers.forEach(prod => {
    self.addProduct(prod);
  });
})([
  {
    productCode: 'ult_small',
    productName: 'Unlimited 1GB',
    price: 24.9
  },
  {
    productCode: 'ult_medium',
    productName: 'Unlimited 2GB',
    price: 29.9
  },
  {
    productCode: 'ult_large',
    productName: 'Unlimited 5GB',
    price: 44.9
  },
  {
    productCode: '1gb',
    productName: '1 GB Data-pack',
    price: 9.9
  }
]);
