# Shopping-Cart-Exercise

## Description
A Shopping Cart System for purchasing multiple SIM cards. The given data are enumerated in the Technical Test Document.

### Assumptions
1. The requirements of a Special Offer could eventually involve multiple Product Types.
2. The incentives of a Special Offer could eventually involve multiple Product Types.
3. Only a maximum of 1 promo code is applicable per transaction.
4. Multiple Special Offers could be applied to one transaction.
5. Offers that requires users to pay higher is more beneficial to the company.
6. In the event of a Special Offer's requirement value being equivalent to another Special Offer's requirement value, it is assumed that the Special Offer that would render the company to provide an offering with less value is more beneficial to it.
7. There are only 4 types of Special Offers: (1) FREEBIE, (2) N_FOR_N_DEAL, (3) BULK_DISCOUNT, and (4) PROMO_CODE. See src/enums/pricing-rule-codes.enum.js for more details.
8. There are only 4 Products: (1) ult_small, (2) ult_medium, (3) ult_large, (4) 1gb. See src/service/products.service for more details.

### Notable Algorithms
The system makes use of weighted sorting in order to evaluate which Special offer is to be applied to the transaction. In such:
1. the Special Offer with the highest Application Value is applied onto the product list
2. the Product List removes the products with applied Special Offer
the process iterates until there are no longer any applicable Special Offers.

Promo Codes are an exception to the previously stated process. Once a promo code is added, and a previous promo code has already been added, the new promo overwrites the previous.

## Running the system
1. Clone the Project
2. Open index.html via Web Browser
3. Open Browser Logs

The system should have already simulated Scenarios 1 - 4 with its output in the console logs of the format:
```
--- SCENARIO n CHECKOUT:
Cart Total: $x
Breakdown:
n x Product Name
...
```

## Adding system tests
Tests are provided in index.html runTests function. By default, Scenarios 1-4 has already been written. If necessary, additional tests scenarios could be added within the said function.

On adding a test, the following must be considered:
1. ShoppingCart.new
  - Creates a New Shopping Cart independent of other Shopping Carts (including pricingRules)
2. cart.add
  - cart is an instance of ShoppingCart.new
  - adds either an item, a promo code, or both.
  - an item should be of the class Product.
    - Products could be obtained from ProductService. See src/service/products.service.js for more details.
3. cart.total
  - cart is an instance of ShoppingCart.new
  - will return a floating point value indicating the total price of the products within the cart with Special Offers applied.
4. cart.formatCartBreakdown
  - cart is an instance of ShoppingCart.new
  - will return a string formatted as a breakdown of the products within the cart, and the freebies obtained from applicable Special Offers.
5. cart.checkout
  - cart is an instance of ShoppingCart.new
  - will clear the shopping cart and the promo codes applied
  - will return the price total and products to be obtained when Special Offers are applied.
  - Format: {total: number, checkoutProducts: [{productCode: string, quantity: number}]}

## System Architecture
Most of the system elements are enclosed into objects for scoping purposes. Singletons are used to manage data. The following are the singletons used:
1. ShoppingCart
  - src/service/shopping-cart.service.js
  - The repository and Manager for carts
  - If transaction alteration is necessary, e.g., changing the implementation of special offers, changes are most likely to occur within this.
  - The implementation of Special Offers is contained at \_getPricingRuleRequirementWeight(pricingRule), \_getPricingRuleIncentiveWeight(pricingRule, productsToBuy), \_extractApplicablePricingRules(pricingRuleCode, productsToBuy), \_applyPricingRule(pricingRule, productsToBuy), and \_getCalculatedPriceAndCheckoutProducts(). Alter these as needed.
2. ProductService
  - src/service/products.service.js
  - The repository and Manager of products.
  - If Available Products alteration is necessary, changes are most likely to occur within this.
  - 4 Products are already predefined: (1) ult_small, (2) ult_medium, (3) ult_large, (4) 1gb. Additional products should be added here. Additional Products could also be added during runtime (check source code for more details).

The system also makes use of Enums for type enumeration. The following are the enums used:
1. PRICING_RULE_CODES
  - src/enums/pricing-rule-codes.enum.js
  - will contain the types of pricing rules applicable.
  - 4 types are already predefined: (1) FREEBIE, (2) N_FOR_N_DEAL, (3) BULK_DISCOUNT, and (4) PROMO_CODE. Additional types not predefined should be added to the enum.
