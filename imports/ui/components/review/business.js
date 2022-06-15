import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import "./business.html";

Template.Component_business.onCreated(function () {
  this.autorun(() => {
    //TODO: narrow scope of subscription
    this.subscribe("restaurants.all");
  });
});

Template.Component_business.helpers({
  showBusinessName() {},
});
