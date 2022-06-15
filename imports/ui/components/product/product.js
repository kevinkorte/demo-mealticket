import { Template } from "meteor/templating";
import { Prices } from "../../../api/prices/prices";

import "./product.html";

Template.Component_product.onCreated(function () {});

Template.Component_product.helpers({
  getPrice(prod_id) {
    const priceObj = Prices.findOne({ "price.data.object.product": prod_id });

    if (priceObj != undefined) {
      // console.log({ priceObj });
      // return priceObj.price.data.object.unit_amount_decimal;
      const cents = priceObj.price.data.object.unit_amount;
      const dollars = cents / 100;
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: priceObj.price.data.object.currency,
      }).format(dollars);
    }
  },
  getCost(prod_id) {
    const priceObj = Prices.findOne({ "price.data.object.product": prod_id });
    if (priceObj != undefined) {
      // console.log({ priceObj });
      // return priceObj.price.data.object.unit_amount_decimal;
      const cents = priceObj.price.data.object.unit_amount;
      return cents;
    }
  },
  quantity(prod_id) {
    const priceObj = Prices.findOne({ "price.data.object.product": prod_id });
    if (priceObj != undefined) {
      const billing_scheme = priceObj.price.data.object.billing_scheme;
      if (billing_scheme == "per_unit") {
        return "each";
      }
    }
  },
  getPriceId(prod_id) {
    const priceObj = Prices.findOne({ "price.data.object.product": prod_id });
    if (priceObj != undefined) {
      return priceObj.price.data.object.id;
    }
  },
});
