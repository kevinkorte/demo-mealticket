// All user-related publications

import { Meteor } from "meteor/meteor";

Meteor.publish("users.all", function () {
  return Meteor.users.find();
});

//Always publishes the roles for the logged in user
//https://github.com/Meteor-Community-Packages/meteor-roles
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ "user._id": this.userId });
  } else {
    this.ready();
  }
});

Meteor.publish("roles", function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ "user._id": this.userId });
  } else {
    this.ready();
  }
});

Meteor.publish("me", function () {
  if (this.userId) {
    return Meteor.users.find(this.userId);
  } else {
    this.ready();
  }
});
