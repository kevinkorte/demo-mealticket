// Methods related to links

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { TaxRates } from "./tax-rates";

Meteor.methods({
  "taxRates.insert"(event) {
    console.log({ event });
    return TaxRates.insert({ event });
  },
  "taxRates.update"(event) {
    console.log({ event });
    const taxRate = event.data.object.id;
    const existingTaxRate = TaxRates.findOne({
      "event.data.object.id": taxRate,
    });
    TaxRates.update(existingTaxRate._id, { event });
  },
});
