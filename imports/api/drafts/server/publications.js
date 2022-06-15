// All draft-related publications

import { Meteor } from "meteor/meteor";
import { Drafts } from "../drafts.js";

Meteor.publish("drafts.all", function () {
  return Drafts.find();
}),
  Meteor.publish("drafts.find", function (draft_id) {
    console.log(draft_id);
    console.log("All up in here");
    console.log(Drafts.findOne(draft_id));
    return Drafts.find({ _id: draft_id });
  });
