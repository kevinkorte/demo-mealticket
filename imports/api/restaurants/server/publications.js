// All restaurant-related publications

import { Meteor } from "meteor/meteor";
import { Restaurants } from "../restaurants";

Meteor.publish("restaurants.all", function () {
  return Restaurants.find();
});
