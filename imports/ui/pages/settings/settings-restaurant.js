import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { Session } from "meteor/session";
import "./settings-restaurant.html";

Template.Page_settings_restaurant.onCreated(function () {
  Meteor.subscribe("me");
  Meteor.subscribe("restaurants.all");
});

Template.Page_settings_restaurant.helpers({
  readChargeStatus() {
    const status = Session.get("chargeStatus");
    if (status == undefined) {
      return "Checking ...";
    } else {
      return status;
    }
  },
  statusColor() {
    const status = Session.get("chargeStatus");
    if (status == undefined) {
      return "text-secondary";
    } else if (status == "Disabled") {
      return "text-danger";
    } else if (status == "Enabled") {
      return "text-success";
    }
  },
  readPayoutStatus() {
    const status = Session.get("payoutStatus");
    if (status == undefined) {
      return "Checking ...";
    } else {
      return status;
    }
  },
  chargesStatus() {
    //This checks Stripe API and returns current status on connected account for chages from Stripe's API
    Meteor.call("accounts.chargeStatus", (error, result) => {
      if (error) {
        console.error(error);
      } else {
        if (result == false) {
          Session.set("chargeStatus", "Disabled");
        } else {
          Session.set("chargeStatus", "Enabled");
        }
      }
    });
  },
  payoutsStatus() {
    //This checks Stripe API and returns current status on connected account for chages from Stripe's API
    Meteor.call("accounts.payoutStatus", (error, result) => {
      if (error) {
        console.error(error);
      } else {
        if (result == false) {
          Session.set("payoutStatus", "Disabled");
        } else {
          Session.set("payoutStatus", "Enabled");
        }
      }
    });
  },
  readEmail() {
    const user = Meteor.user();
    return user.emails[0].address;
  },
});

Template.Page_settings_restaurant.events({
  "click #stripe-account-link"() {
    Meteor.call("accounts.createAccountLink", (error, result) => {
      if (error) {
        console.error(error);
      } else {
        FlowRouter.go(result.url);
      }
    });
  },
});
