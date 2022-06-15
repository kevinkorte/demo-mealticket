import "./invoice.html";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

Template.Component_invoice.helpers({
  formatCurrency(cents, currency) {
    const dollars = cents / 100;
    if (currency === null) {
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: "usd",
      }).format(dollars);
    } else {
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: currency,
      }).format(dollars);
    }
  },
  taxes(taxRates) {
    console.log({ taxRates });
  },
});
