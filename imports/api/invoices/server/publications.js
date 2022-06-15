//All invoice-related publications

import { Meteor } from "meteor/meteor";
import { Invoices } from "../invoices";

Meteor.publish("invoices.all", function () {
  return Invoices.find();
});

Meteor.publish("invoices.findOne", function (draft_id) {
  return Invoices.find({ draft_id: draft_id });
});
