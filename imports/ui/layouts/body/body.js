import { Template } from "meteor/templating";
import "./body.html";
import "../../components/nav/navbar-customer";
import "../../components/nav/navbar-restaurant";

Template.App_body.onCreated(function () {
  this.autorun(() => {
    this.subscribe("me");
  });
});

Template.App_body.helpers({
  showMenu() {
    const user = Meteor.user();
    if (user) {
      console.log({ user });
      if (user.account_type === "restaurant") {
        return true;
      } else {
        return false;
      }
    }
  },
});
