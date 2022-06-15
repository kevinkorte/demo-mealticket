import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import "./login.html";

Template.Page_login.events({
  "submit #login"(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        console.error(error);
        Session.set("hasError", true);
        Session.set("errorMessage", error.reason);
      } else {
        Meteor.call("accounts.returnAccountType", (error, result) => {
          if (error) {
            console.error(error);
          } else {
            if (result == "restaurant") {
              FlowRouter.go("Restaurant.settings");
            }
          }
        });
        // FlowRouter.go("App.restaurants");
      }
    });
  },
});

Template.Page_login.helpers({
  shouldShowError() {
    const status = Session.get("hasError");
    if (status) {
      return true;
    } else {
      return false;
    }
  },
  showErrorReason() {
    return Session.get("errorMessage");
  },
});
