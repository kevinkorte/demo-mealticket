import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import "./restaurants.html";
import { Restaurants } from "../../../api/restaurants/restaurants";

Template.Page_restaurants.onCreated(function () {
  Meteor.subscribe("restaurants.all");
});

Template.Page_restaurants.helpers({
  restaurant() {
    return Restaurants.find();
  },
});
