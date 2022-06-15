import { Template } from "meteor/templating";
import "./navbar-customer.html";

Template.Component_nav_customer.helpers({
  userIsLoggedIn() {
    //if the user is logged in, show them menu items for their account
    //i.e. settings link
    //or show the user the login/signup links
    if (Meteor.userId()) {
      //There is a logged in user
      return true;
    } else return false;
  },
});
