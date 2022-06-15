// Methods related to subscriptions

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Subscriptions } from "./subscriptions";
import { Restaurants } from "../restaurants/restaurants";
import { Drafts } from "../drafts/drafts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Invoices } from "../invoices/invoices";
dayjs.extend(utc);
dayjs.extend(timezone);

Meteor.methods({
  async "subscriptions.preview"(items, restaurantId) {
    const restaurant = Restaurants.findOne(restaurantId);
    console.log({ items });
    for (const [index, item] of items.entries()) {
      console.log({ item });
    }
    //TODO: If customer id can't be found on user profile, ask stripe for it by email
    const stripe = require("stripe")(Meteor.settings.private.stripe_sk);
  },
  async "subscriptions.start"(draft_id) {
    const stripe = require("stripe")(Meteor.settings.private.stripe_sk);
    const user = Meteor.user();
    const draft = Drafts.findOne(draft_id);
    const restaurant = Restaurants.findOne(draft.restaurant_id);
    const invoice = Invoices.findOne(draft.invoice_id);
    const subscription = await stripe.subscriptionSchedules.create(
      {
        customer: invoice.invoice.customer,
        phases: [
          {
            items: draft.items,
          },
        ],
        start_date: draft.anchor,
        default_settings: {
          application_fee_percent: 9,
        },
        // items: draft.items,
        // application_fee_percent: 9,
        // billing_cycle_anchor: draft.anchor,
        // proration_behavior: "none",
        metadata: {
          platform_customer_id: user.customerId,
          user_id: user._id,
        },
        // default_tax_rates: ["txr_1Ki4UGPg3aL0wGFvsibWfBOQ"],
      },
      {
        // stripeAccount: restaurant.stripe_id,
        stripeAccount: restaurant.stripe_id,
      }
    );
    return Subscriptions.insert(subscription);
  },
  async "subscriptions.getPaymentMethods"() {
    const stripe = require("stripe")(Meteor.settings.private.stripe_sk);
    const user = Meteor.user();
    const paymentMethods = await stripe.customers.listPaymentMethods(
      user.customerId,
      { type: "card" }
    );
    return paymentMethods;
  },
});
