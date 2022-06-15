// All subscription-related publications

import { Meteor } from "meteor/meteor";
import { Subscriptions } from "../subscriptions";

Meteor.publish("subscriptions.find", function (sub_id) {
  return Subscriptions.find(sub_id);
});
