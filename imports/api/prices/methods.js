// Methods related to prices

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Prices } from "./prices";

Meteor.methods({
  "prices.insert"(price) {
    console.log("MADE IT TO PRICES INSERT");
    return Prices.insert({
      price,
    });
  },
});
