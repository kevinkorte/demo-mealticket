//Changes and settings for the Accounts package defined below
import { Accounts } from "meteor/accounts-base";

Accounts.urls.enrollAccount = (token) => {
  return Meteor.absoluteUrl(`invitation/${token}`);
};
