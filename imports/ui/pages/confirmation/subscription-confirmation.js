import { Template } from "meteor/templating";
import { Subscriptions } from "../../../api/subscriptions/subscriptions";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import "./subscription-confirmation.html";

Template.Page_subscription_confirmation.onCreated(function () {
  const sub_id = FlowRouter.getQueryParam("subscription");
  if (sub_id) {
    this.autorun(() => {
      this.subscribe("subscriptions.find", sub_id);
    });
  }
});
