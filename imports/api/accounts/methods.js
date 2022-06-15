import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Random } from "meteor/random";
import { Restaurants } from "../../api/restaurants/restaurants";
const stripe = require("stripe")(Meteor.settings.private.stripe_sk);

Meteor.methods({
  "accounts.findUserByEmail"(email) {
    check(email, String);
    //first called during the login flow of the admin login to verify
    //the id in the url matches the admin id
    if (email != "") {
      const account = Accounts.findUserByEmail(email);
      return account;
    } else {
      throw new Meteor.Error("invalid", "Invalid login attempt");
    }
  },
  "accounts.isUserSuperAdminByEmail"(email) {
    const user = Accounts.findUserByEmail(email);
    return Roles.userIsInRole(user._id, "super-admin");
  },
  "accounts.sendEnrollmentEmail"(userId) {
    Accounts.sendEnrollmentEmail(userId);
  },
  async "accounts.createAccountLink"() {
    //Generate a one-time link for Connected accounts on Stripe
    const user = Meteor.user();
    const accountLink = await stripe.accountLinks.create({
      account: user.stripe_id,
      refresh_url: Meteor.settings.private.stripe_refresh_url,
      return_url: Meteor.absoluteUrl("restaurant/settings", { secure: true }),
      type: "account_onboarding",
    });
    return accountLink;
  },
  async "accounts.chargeStatus"() {
    const user = Meteor.user();
    const account = await stripe.accounts.retrieve(user.stripe_id);
    return account.charges_enabled;
  },
  async "accounts.payoutStatus"() {
    const user = Meteor.user();
    const account = await stripe.accounts.retrieve(user.stripe_id);
    return account.payouts_enabled;
  },
  async "accounts.createCustomer"(email) {
    //1. Create a Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      //2. Add the customers ID to the stripe customer metadata
      metadata: {
        _id: Meteor.userId(),
      },
    });
    //3. Save the stripe customer ID on the user doc
    Meteor.users.update(Meteor.userId(), {
      $set: { customerId: customer.id, account_type: "user" },
    });
  },
  async "accounts.adminCreateRestaurant"(email) {
    //Called from the admin page only during early access
    check(email, String);
    //1. Verify this request is coming from a super-admin
    const isAdmin = Roles.userIsInRole(Meteor.userId(), "super-admin");
    if (isAdmin) {
      //2. Create a restaurant
      const restId = Restaurants.insert({});
      //3. Create the user account
      const userId = Accounts.createUser({ email: email });
      //4. Add restaurant id to user account
      Meteor.users.update(userId, {
        $set: { restaurant_id: restId, account_type: "restaurant" },
      });
      //5. Add user id to restaurant as owner
      Restaurants.update(restId, { $set: { owner_id: userId } });
      //6. Add "owner" role to user with Roles package
      Roles.addUsersToRoles(userId, "owner", restId);
      //7. Create stripe connected account
      const stripeAccount = await stripe.accounts.create({
        type: "standard",
        email: email,
        metadata: {
          owner_id: userId,
          restaurant_id: restId,
        },
      });
      //8. Save stripe id to restaurant account
      // Also, set "open" to false to start, can be changed to true
      //once available for orders with Stripe
      Restaurants.update(restId, {
        $set: {
          stripe_id: stripeAccount.id,
          open: false,
          slug_id: Random.id(6),
          //FIXME: Make dynamic
          slug: "Teriyaki-Grill-Kennewick",
        },
      });
      //9. Save stripe id to user account
      Meteor.users.update(userId, { $set: { stripe_id: stripeAccount.id } });
      //10. Send enrollment email to user
      Accounts.sendEnrollmentEmail(userId);
    } else {
      throw new Meteor.Error("invalid", "This request is invalid");
    }
  },
  "accounts.returnAccountType"() {
    return Meteor.user().type;
  },
  async "accounts.session"() {
    const user = Meteor.user();
    const session = await stripe.checkout.sessions.create({
      cancel_url:
        "http://localhost:3000/restaurant/qsqKnR/Teriyaki-Grill-Kennewick",
      success_url:
        "http://localhost:3000/restaurant/qsqKnR/Teriyaki-Grill-Kennewick",
      mode: "setup",
      customer: user.customerId,
      payment_method_types: ["card"],
    });
    return session;
  },
  async "accounts.setupIntent"(queryParam) {
    const user = Meteor.user();
    const session = await stripe.checkout.sessions.create({
      success_url: Meteor.absoluteUrl(`review?order=${queryParam}`),
      cancel_url: Meteor.absoluteUrl("restaurants"),
      mode: "setup",
      customer: user.customerId,
      payment_method_types: ["card"],
    });
    return session;
  },
});
