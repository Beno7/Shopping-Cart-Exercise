// Singleton
// Will be managing Carts and Pricing Rules
// Could be done via JSON object. Done this instead - personal preference.
// ShoppingCart should be const so that it does not get overwritten in the program
const ShoppingCart = new (function() {
  var self = this;

  function _createShoppingCart(shoppingRules) {
    // This Shopping Cart's Shopping Rules
    var _shoppingRules = [];
    var _promoCodesApplied = [];
    // cart container <{productCode<string>: quantity<number>}>
    var _cart = {};

    // initialise shopping rules
    (shoppingRules || []).forEach(shoppingRule => {
      _addShoppingRule(shoppingRule);
    });
    /*console.log('Shopping Rules of New Cart Initialised:', _shoppingRules);
    _shoppingRules.forEach((shoppingRule, i) => {
      console.log('Shopping Rule', i, ':', shoppingRule.toJson());
    });*/

    /**
     * Add Item to Cart
     * @param item
     * @param promoCode
     */
    function _addToCart(item, promoCode) {
      // check if user added a promocode
      if (promoCode) {
        // check if promocode is valid
        promoCode = _getShoppingRuleWithPromoCode((promoCode || '').trim());
        if (promoCode) {
          // check if promocode has not been applied yet
          if (!_isPromoCodeApplied(promoCode.getPricingMetadata().code)) {
            // apply promocode
            _promoCodesApplied.push(promoCode);
          }
        }
      }
      // check if user added an item
      if (item) {
        // check if item is valid
        if (ProductService.getProduct(item.getProductCode())) {
          // console.log('adding item:', item.getProductCode());
          // add item and quantity of said items to cart
          _cart[item.getProductCode()] = (_cart[item.getProductCode()] || 0) + 1;
        }
      }
    }

    /**
     * Checks if promo code is already applied
     * @param promoCode string
     * @returns bool
     */
    function _isPromoCodeApplied(promoCode) {
      return _promoCodesApplied
        .filter(promo => {
          return promo.getPricingMetadata().code === promoCode;
        }).length > 0;
    }

    /**
     * Gets Shopping Rule with the Given Id
     * @param id
     * @returns AmaysimPricingRule | null
     */
    function _getShoppingRuleWithId(id) {
      const filteredArray = _shoppingRules.filter((shoppingRule) => {
        return shoppingRule.getId() === id;
      });
      return filteredArray.length > 0 ? filteredArray[0] : null;
    }

    /**
     * Gets Pricing Rule With Promo Code
     * @param promoCode
     * @returns AmaysimPricingRule | null
     */
    function _getShoppingRuleWithPromoCode(promoCode) {
      const filteredArray = _shoppingRules
        .filter((shoppingRule) => {
          return shoppingRule.getPricingRuleCode() === PricingRuleCodes.PROMO_CODE;
        })
        .filter((shoppingRule) => {
          return (shoppingRule.getPricingMetadata() || {}).code === promoCode;
        });
      return filteredArray.length > 0 ? filteredArray[0] : null;
    }

    /**
     * Updates a Shopping Rule
     * @param id
     * @param update {productCode: string?, pricingRuleCode: string?, pricingMetadata: any}
     * @returns AmaysimPricingRule | null;
     */
    function _updateShoppingRuleWithId(id, update) {
      var index = -1;
      _shoppingRules.forEach((sR, i) => {
        if (sR.getId() === id) {
          index = i;
        }
      });
      if (index > -1) {
        _shoppingRules[index].update(update);
        return _shoppingRules[index];
      }
      return null;
    }

    /**
     * Removes a Shopping Rule
     * @param id
     * @returns AmaysimPricingRule | null;
     */
    function _removeShoppingRuleWithId(id) {
      var index = -1;
      _shoppingRules.forEach((sR, i) => {
        if (sR.getId() === id) {
          index = i;
        }
      });
      return index > -1 ? _shoppingRules.splice(index, 1) : null;
    }

    /**
     * Adds a Shopping Rule
     * @param shoppingRule {_id: string, productCode: string, pricingRuleCode: string, pricingMetadata: any}
     * @returns AmaysimPricingRule | null
     */
    function _addShoppingRule(shoppingRule) {
      if (AmaysimPricingRule.isJsonValid(shoppingRule || {})){
        if (!_getShoppingRuleWithId(shoppingRule._id.trim())) { // if id does not exist yet
          shoppingRule = new AmaysimPricingRule(shoppingRule);
          if (shoppingRule.getPricingRuleCode() === PricingRuleCodes.PROMO_CODE) { // check if pricingRuleCode is freebie.
            if (_getShoppingRuleWithPromoCode((shoppingRule.getPricingMetadata() || {}).code || '')) { // return null if promo code already exists
              return null;
            }
          }
          _shoppingRules.push(shoppingRule);
          return shoppingRule;
        }
      }
      return null;
    }

    /**
     * Gets Pricing Rule Requirement Weight.
     * Normally, Sales Dept pushes for discounts with higher revenue from users.
     * Those would be prioritised in this scenario.
     * @param pricingRule
     * @returns number
     */
    function _getPricingRuleRequirementWeight(pricingRule) {
      var weight = 0;
      pricingRule.getPricingMetadata().requirements.forEach(reqt => {
        weight += ProductService.getProduct(reqt.productCode).getProductPrice() * reqt.minQuantity;
      });
      return weight;
    }

    /**
     * Gets Pricing Rule Incentive weight
     * Assumes that PricingRuleCode is applicable
     * Normally, a business would choose to provide a discount with lower incentive rates
     * with respect to a discount with equivalent requirement weight
     * @param pricingRule
     * @param productsToBuy <{productCode<string> : quantity: <number>}>
     *                      (only needed if shopping rule code is BULK_DISCOUNT)
     * @returns number
     */
    function _getPricingRuleIncentiveWeight(pricingRule, productsToBuy) {
      var weight = 0;
      if (pricingRule.getPricingRuleCode() === PricingRuleCodes.BULK_DISCOUNT) {
        // iterate through each incentive and store newPrice to a temporary variable.
        const newPrices = {};
        pricingRule.getPricingMetadata().incentives.forEach(incentive => {
          // if a new entry for the same product code occurs, ignore the new entry.
          if (!newPrices[incentive.productCode]) {
            newPrices[incentive.productCode] = incentive.newPrice;
          }
        });
        // multiply each applicable product quantity from productsToBuy to newPrice
        Object.keys(newPrices).forEach(productCode => {
          // summate all values.
          weight += (productsToBuy[productCode] || 0) * newPrices[productCode];
        });
      } else {
        pricingRule.getPricingMetadata().incentives.forEach(incentive => {
          weight += ProductService.getProduct(incentive.productCode).getProductPrice() * incentive.quantity;
        });
      }
      return weight;
    }

    /**
     * Extracts Applicable Pricing Rules sorted by weighted value
     * @param pricingRuleCode
     * @param productsToBuy productsToBuy: <{productCode<string> : quantity: <number>}>
     * @return [AmaysimPricingRule]
     */
    function _extractApplicablePricingRules(pricingRuleCode, productsToBuy) {
      // var products = ProductService.getProductCodesByValue(true);
      return _shoppingRules
        .filter(shoppingRule => {
          return shoppingRule.getPricingRuleCode() === pricingRuleCode;
        })
        .filter(shoppingRule => {
          var meetsRequirements = true;
          const tempCountContainer = {};
          // console.log(shoppingRule.getPricingMetadata());
          shoppingRule.getPricingMetadata().requirements.forEach(reqt => {
            tempCountContainer[reqt.productCode] = tempCountContainer[reqt.productCode]
              ? (tempCountContainer[reqt.productCode] + reqt.minQuantity) : reqt.minQuantity;
          });
          Object.keys(tempCountContainer).forEach(productCode => {
            if ((productsToBuy[productCode] || 0) < tempCountContainer[productCode]) {
              meetsRequirements = false;
            }
          });
          return shoppingRule.getPricingRuleCode() === pricingRuleCode && meetsRequirements;
        })
        .sort((shoppingRuleA, shoppingRuleB) => {
          const ruleAReqtWeight = _getPricingRuleRequirementWeight(shoppingRuleA);
          const ruleBReqtWeight = _getPricingRuleRequirementWeight(shoppingRuleB);
          const ruleAInctWeight = _getPricingRuleIncentiveWeight(shoppingRuleA);
          const ruleBInctWeight = _getPricingRuleIncentiveWeight(shoppingRuleB);
          const reqtSortValue = ruleBReqtWeight - ruleAReqtWeight;
          // If requirement weight is not equal, use requirement weight as value. Else,
          // Use Incentive Weight as value. Incentive should be treated the opposite of a
          // requirement - User must obtain the least-gaining incentive.
          return reqtSortValue !== 0 ? reqtSortValue : (ruleAInctWeight - ruleBInctWeight);
        });
    }

    /**
     * Applies a pricing rule
     * Does not check if pricing rule is valid
     * @param pricingRule AmaysimPricingRule
     * @param productsToBuy <{productCode<string> : quantity: <number>}>
     * @returns <{productsToBuy: <{productCode<string> : quantity: <number>}>, priceToDeduce: number, freeProducts: <{productCode<string> : quantity: <number>}>}>
     */
    function _applyPricingRule(pricingRule, productsToBuy) {
      const tempProds = {...productsToBuy};
      const meta = pricingRule.getPricingMetadata();
      var reqt = meta.requirements;
      var inct = meta.incentives;
      if (pricingRule.getPricingRuleCode() === PricingRuleCodes.N_FOR_N_DEAL) {
        var priceToDeduce = 0;
        // subtract quantity of affected pricing rule application
        reqt.forEach(req => {
          productsToBuy[req.productCode] -= req.minQuantity;
        });
        // subtract equivalent price
        inct.forEach(inct => {
          priceToDeduce += (ProductService.getProduct(inct.productCode).getProductPrice() * inct.quantity);
        });
        return {
          productsToBuy: productsToBuy,
          priceToDeduce: priceToDeduce
        };
      } else if (pricingRule.getPricingRuleCode() === PricingRuleCodes.BULK_DISCOUNT) {
        // will remove all products with already implicated BULK_DISCOUNT pricing rule
        // parse newprice
        const newPrices = {};
        var totalPrice = 0;
        var discountedPrice = 0;
        inct.forEach(incentive => {
          // if a new entry for the same product code occurs, ignore the new entry.
          if (!newPrices[incentive.productCode]) {
            newPrices[incentive.productCode] = incentive.newPrice;
          }
        });
        Object.keys(newPrices).forEach(prodCode => {
          // calculate total product price affected by incentive
          totalPrice += ProductService.getProduct(prodCode).getProductPrice() * productsToBuy[prodCode];
          // calculate total discounted product price
          discountedPrice += newPrices[prodCode] * productsToBuy[prodCode];
          productsToBuy[prodCode] = 0;
        });
        return {
          productsToBuy: productsToBuy,
          priceToDeduce: totalPrice - discountedPrice
        };
      } else if (pricingRule.getPricingRuleCode() === PricingRuleCodes.FREEBIE) {
        // subtract quantity of affected pricing rule application
        reqt.forEach(req => {
          productsToBuy[req.productCode] -= req.minQuantity;
        });
        // will only evaluate one freebie at a time.
        const freeProducts = {};
        inct.forEach(inct => {
          freeProducts[inct.productCode] = freeProducts[inct.productCode] ? (freeProducts[inct.productCode] + inct.quantity) : inct.quantity;
        });
        return {
          productsToBuy: productsToBuy,
          priceToDeduce: 0,
          freeProducts: freeProducts
        };
      }
    }

    /**
     * Calculates the total and provides the checkout products (including freebies)
     * @returns {total: number, checkoutProducts[{productCode: string, quantity: number}]}
     */
    function _getCalculatedPriceAndCheckoutProducts() {
      // promo code container
      var chosenPromoCodeDiscount = null;
      var checkoutProducts = {}; // data to output <productCode<string>: quantity<number>>
      const productsToBuy = {..._cart}; // copy of current cart object
      var total = 0; // will contain the summation of all cart products
      var freeProducts = {}; // data to output <productCode<string>: quantity<number>>

      // summate temporary total here
      Object.keys(productsToBuy).forEach(productCode => {
        // console.log('Product and quantity', productCode, productsToBuy[productCode]);
        total += (ProductService.getProduct(productCode).getProductPrice() * productsToBuy[productCode]);
      });

      // console.log('total updated:', total);

      // N_FOR_N_DEALS
      // extract (type) discount and sort decreasing by requirements. Weight should depend on product value.
      // In the case of multiple applicable (type) discount, always choose the deal with many requirements first
      // Subtract Available Products and Iterate through the applicable (type) discounts. Repeat the Process.
      Object.keys(PricingRuleCodes)
        .filter(rule => {
          return rule !== PricingRuleCodes.PROMO_CODE;
        })
        .forEach(pricingRuleCode => {
          var priceToDeduce = 0;
          var tempProductsToBuy = {..._cart};
          var applicableRules = _extractApplicablePricingRules(pricingRuleCode, tempProductsToBuy);
          while (applicableRules.length > 0) {
            var ruleToApply = applicableRules[0];
            const ruleApplied = _applyPricingRule(ruleToApply, tempProductsToBuy);
            // console.log('Rule Applied', ruleApplied, ruleToApply.getPricingRuleCode(), tempProductsToBuy);
            // will contain the remaining products that do not have any promos applied to
            // after the application of rule
            tempProductsToBuy = {...ruleApplied.productsToBuy};
            // will be obtained if N_FOR_N_DEAL or BULK_DISCOUNT
            priceToDeduce = ruleApplied.priceToDeduce;
            // ffeeproducts will only be obtained if FREEBIE
            Object.keys(ruleApplied.freeProducts || {}).forEach(prodCode => {
              freeProducts[prodCode] = (freeProducts[prodCode] || 0) + ruleApplied.freeProducts[prodCode];
            });
            // update applicable rules
            applicableRules = _extractApplicablePricingRules(pricingRuleCode, tempProductsToBuy);
          }
          total -= priceToDeduce;
        });

      // Extract promo code to be utilised.
      // Assume that promocodes are not stackable.
      // Assume that promocodes only provide a percentage discount (Not a constant value)
      // in the event of multiple promo codes applied, check which promo code offers the most discount and use that.
      _promoCodesApplied.forEach(promoCode => { // iterate through applied promo codes
        var calculatedDiscount = 0;
        var potentialDiscounts = promoCode.getPricingMetadata().discounts;
        potentialDiscounts.forEach(potentialDiscount => {
          // iterate through discount productcodes of the promocode
          potentialDiscount.productCodes.forEach(productCode => {
            if (productsToBuy[productCode] || 0) {
              // add promocode product discount to calculatedDiscount
              calculatedDiscount +=
                (potentialDiscount.percentage
                * ProductService.getProduct(productCode).getProductPrice()
                * productsToBuy[productCode]);
            }
          });
        });
        if (!chosenPromoCodeDiscount) { // set calculatedDiscount to initially iterated value
          chosenPromoCodeDiscount = calculatedDiscount;
        } else if(calculatedDiscount > chosenPromoCodeDiscount) { // only set discount if calculatedDiscount is greater than the already chosen discount.
          chosenPromoCodeDiscount = calculatedDiscount;
        }
      });
      // in the event of multiple discounts available, consider one with the most value.
      if (chosenPromoCodeDiscount !== null && total > 0) {
        // total -= (total * chosenPromoCodeDiscount); incorrect calculation
        total -= chosenPromoCodeDiscount;
      }

      // place in cart in checkoutProducts
      // integrate free products to checkoutProducts
      checkoutProducts = {..._cart};
      Object.keys(freeProducts || {}).forEach(prodCode => {
        checkoutProducts[prodCode] = (checkoutProducts[prodCode] || 0) + freeProducts[prodCode];
      });

      return {
        total: parseFloat((Math.round(total*100)/100).toFixed(2)),
        checkoutProducts: checkoutProducts
      };
    }

    /**
     * Returns Calculated Price and Checkout Products
     * Resets cart and promoCodesApplied
     * @returns {total: number, checkoutProducts[{productCode: string, quantity: number}]}
     */
    function _checkout() {
      const temp = _getCalculatedPriceAndCheckoutProducts();
      _promoCodesApplied = [];
      _cart = {};
      return temp;
    }

    /**
     * Formats Cart Product Breakdown
     */
    function _formatCartBreakdown() {
      var str = '';
      const checkoutProducts = _getCalculatedPriceAndCheckoutProducts().checkoutProducts;
      ProductService.getProductCodesByValue().forEach(prodCode => {
        if (checkoutProducts[prodCode])
          str += `${checkoutProducts[prodCode]} x ${ProductService.getProduct(prodCode).getProductName()}\n`;
      });
      return str;
    }

    return {
      add: _addToCart,
      getShoppingRuleWithId: _getShoppingRuleWithId,
      updateShoppingRuleWithId: _updateShoppingRuleWithId,
      removeShoppingRuleWithId: _removeShoppingRuleWithId,
      addShoppingRule: _addShoppingRule,
      getCalculatedPriceAndCheckoutProducts: _getCalculatedPriceAndCheckoutProducts,
      checkout: _checkout,
      formatCartBreakdown: _formatCartBreakdown,
      get total() {
        return _getCalculatedPriceAndCheckoutProducts().total;
      }
    };
  }

  /**
   * Creates a New Shopping Cart
   * @param pricingRules
   * @returns {add: <(item, promoCode) -> {}>, total: <int>}
   */
  this.new = (pricingRules) => {
    return _createShoppingCart(pricingRules);
  }

})();
