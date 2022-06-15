import { Template } from "meteor/templating";
import { Restaurants } from "../../../api/restaurants/restaurants";
import "./home.html";
import "../../components/hello/hello.js";
import "../../components/info/info.js";

Template.App_home.onCreated(function () {
  this.autorun(() => {
    this.subscribe("restaurants.all");
  });
});

Template.App_home.helpers({
  findRestaurants() {
    return Restaurants.find();
  },
});

Template.App_home.events({
  "click #button"(event) {
    Meteor.call("drafts.insert");
  },
});
