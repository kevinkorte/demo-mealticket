// All product-related publications

import { Meteor } from "meteor/meteor";
import { Products } from "../products";

Meteor.publish("products.all", function () {
  return Products.find();
});
