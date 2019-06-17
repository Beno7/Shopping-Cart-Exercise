/**
 * Will Contain the Pricing Rule
 * @param shoppingRule {_id: string, pricingRuleCode: string, pricingMetadata: any}
 */
function AmaysimPricingRule(shoppingRule = {}) {
  const self = this;
  var _id, _pricingRuleCode, _pricingMetadata;
  /**
   * Pricing Metadata Format:
   * if _pricingRuleCode is .N_FOR_N_DEAL, .BULK_DISCOUNT, or .FREEBIE
   * <{
      requirements: [ <{productCode: string, minQuantity: number}> ],
      incentives: [
        // If N_FOR_N_DEAL || FREEBIE
        <{productCode: string, quantity: number}>
        // If BULK_DISCOUNT
        <{productCode: string, newPrice: number}>
      ]
    }>
   *
   * if _pricingRuleCode is PROMO_CODE
   * <{code: string, discount: { percentage: number }}>
   * Wherein percentage is its proportion to 1
   *
  */

  /**
   * initialises the object
   * @param id
   * @param pricingRuleCode
   * @param pricingMetadata
   */
  function _init(id, pricingRuleCode, pricingMetadata) {
    _id = id;
    _pricingRuleCode = pricingRuleCode;
    _pricingMetadata = pricingMetadata;
  }
  /**
   * Updates the instance with the given update object
   * @param update {pricingRuleCode: string?, pricingMetadata: any}
   */
  this.update = function(update) {
    if (PricingRuleCodes[(update.pricingRuleCode || '').trim()])
      _pricingRuleCode = update.pricingRuleCode.trim();
    _pricingMetadata = update.pricingMetadata || _pricingMetadata;
  };
  /**
   * Gets Pricing Rule Code
   * @returns "FREEBIE" | "N_FOR_N_DEAL" | "X_FOR_X_DEAL" | "PROMO_CODE"
   */
  this.getPricingRuleCode = function() {
    return _pricingRuleCode;
  };
  /**
   * Gets Pricing Metadata
   * @returns any
   */
  this.getPricingMetadata = function() {
    return _pricingMetadata;
  };
  /**
   * Gets Id
   * @returns string
   */
  this.getId = function() {
    return _id;
  };
  /**
   * Convert Pricing Rule to JSON
   */
  this.toJson = function() {
    return {
      _id: _id,
      pricingRuleCode: _pricingRuleCode,
      pricingMetadata: _pricingMetadata
    }
  }
  /**
    *
    */
  _init(
    shoppingRule._id,
    shoppingRule.pricingRuleCode,
    shoppingRule.pricingMetadata
  );
}

/**
 * Check if pricing rule is valid
 * Static method
 * @param shoppingRule
 */
AmaysimPricingRule.isJsonValid = function(shoppingRule = '') {
  return (shoppingRule._id || '').trim()
    && PricingRuleCodes[shoppingRule.pricingRuleCode || ''];
};
