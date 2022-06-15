// Methods related to plans

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Plans } from "./plans";

Meteor.methods({
  "plans.insert"(plan) {
    console.log("MADE IT TO PLANS INSERT");
    return Plans.insert({
      plan,
    });
  },
});
