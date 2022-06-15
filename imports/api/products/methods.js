// Methods related to products

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Products } from "./products";

Meteor.methods({
  "products.insert"(product) {
    console.log("MADE IT TO PRODUCTS INSERT");
    return Products.insert({
      product,
    });
  },
});
