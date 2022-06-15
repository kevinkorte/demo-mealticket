import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Accounts } from "meteor/accounts-base";
import { Session } from "meteor/session";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import "./signup.html";

Template.Signup_form.onCreated(function () {
  this.autorun(() => {
    this.subscribe("me");
  });
});

Template.Signup_form.helpers({
  shouldShowError() {
    const status = Session.get("hasSignupError");
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

Template.Signup_form.events({
  "submit #signup"(event) {
    event.preventDefault();
    Session.set("hasSignupError", null);
    Session.set("errorMessage", null);
    const email = event.target.email.value;
    const password = event.target.password.value;
    Accounts.createUser({ email, password }, (error) => {
      if (error) {
        //TODO: Handle error
        console.error(error);
        Session.set("hasSignupError", true);
        Session.set("errorMessage", error.reason);
      } else {
        Meteor.call("accounts.createCustomer", email, (error, result) => {
          if (error) {
            //TODO: Handle error
            console.error(error);
            Session.set("hasSignupError", true);
            Session.set("errorMessage", error.reason);
          } else {
            //Decide to route home or close model depending on the url that is being shown
            // FlowRouter.go("App.home");
            const queryParam = FlowRouter.getQueryParam("next");
            if (queryParam) {
              //Create a setup intent before being able to clone to the connected account
              // FlowRouter.go("App.review", {}, { review: queryParam });
              Meteor.call(
                "accounts.setupIntent",
                queryParam,
                (error, result) => {
                  if (error) {
                    //TODO: Handle error
                    console.error(error);
                  } else {
                    // console.log({ result });
                    FlowRouter.go(result.url);
                  }
                }
              );
            } else {
              //close the model and go to the next step
              FlowRouter.go("App.home");
            }
          }
        });
      }
    });
  },
});
