// Make sure my admin account always exists

import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";
const stripe = require("stripe")(Meteor.settings.private.stripe_sk);

Meteor.startup(() => {
  //1. Set up all role accounts
  //2. Make sure my admin account always exists
  //These are "types" of user accounts
  console.log("Create roles");
  Roles.createRole("vendor", { unlessExists: true });
  Roles.createRole("customer", { unlessExists: true });
  Roles.createRole("owner", { unlessExists: true });
  Roles.createRole("owner-admin", { unlessExists: true });
  Roles.createRole("super-admin", { unlessExists: true });
  //Roles.createRole("[ROLE]", { unlessExists: true });
  //Any future special premissions should be added below, and then assigned to the appropriate roles above
  //First create the role above, than add it below
  //EX: Roles.addRolesToParent("[ROLE]", "[MASTER ROLE");
  //Add Kevin's admin account if it doesn't exist and console.log the id
  const result = Accounts.findUserByEmail(Meteor.settings.private.email);
  //if we get a result, there is an account
  if (result != null) {
    console.log("Admin email found. Account: ", result);
  } else {
    console.log("No admin account found, creating one ...");
    //Create my admin account
    const userId = Accounts.createUser({
      email: Meteor.settings.private.email,
    });
    //Assign my admin account to the super-admin role
    Roles.addUsersToRoles(userId, "super-admin");
    console.log("Admin account created. Admin ID: ", userId);
  }

  //Add a demo restaurant
  const users = Meteor.users.find();
  console.log("USERS COUNT: ", users.count());
  users.forEach((user) => {
    console.log({ user });
    console.log(user.emails[0].address);
  });
  // Meteor.call("accounts.adminCreateRestaurant", "kevintestingapps@gmail.com");
});
