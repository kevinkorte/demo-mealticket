import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Accounts } from "meteor/accounts-base";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import "./admin-login.html";

Template.Admin_login.events({
  "submit #admin-login"(event) {
    event.preventDefault();
    const urlId = FlowRouter.getParam("id");
    const email = event.target.email.value;

    Meteor.call("accounts.findUserByEmail", email, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        //verify that the user id is in the url
        if (urlId == result._id) {
          //also need to handle when result (user account) returns undefined
          Accounts.requestLoginTokenForUser({
            selector: email,
            options: {
              userCreationDisabled: true,
            },
          });
        } else {
          throw new Meteor.Error("invalid", "Invalid login attempt");
        }
      }
    });
  },
});
