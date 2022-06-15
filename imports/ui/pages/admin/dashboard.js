import { Template } from "meteor/templating";
import { Restaurants } from "../../../api/restaurants/restaurants";
import "./dashboard.html";
import "../../components/admin/new-restaurant-form";
import "../../components/admin/restaurant-card";

Template.Admin_dashboard.onRendered(function () {
  Meteor.subscribe("restaurants.all");
  this.autorun(() => {
    this.subscribe("restaurants.all");
  });
});

Template.Admin_dashboard.helpers({
  restaurants() {
    return Restaurants.find();
  },
});
