import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { Accounts } from "meteor/accounts-base";
import "./invitation.html";

Template.Page_invitation.events({
  "submit #save-password"(event) {
    event.preventDefault();
    const token = FlowRouter.getParam("token");
    const password = event.target.password.value;
    Accounts.resetPassword(token, password, (error) => {
      if (error) {
        console.error(error);
      } else {
        FlowRouter.go("Restaurant.settings");
      }
    });
  },
});
