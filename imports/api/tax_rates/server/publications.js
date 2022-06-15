// All tax rate related publications

import { Meteor } from "meteor/meteor";
import { TaxRates } from "../tax-rates";

Meteor.publish("taxRates.all", function () {
  return TaxRates.find();
});
