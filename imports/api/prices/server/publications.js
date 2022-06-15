// All price-related publications

import { Meteor } from "meteor/meteor";
import { Prices } from "../prices";

Meteor.publish("prices.all", function () {
  return Prices.find();
});
