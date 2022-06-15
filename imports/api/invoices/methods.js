//Methods related to invoices

import { Meteor } from "meteor/meteor";
// import Stripe from "stripe";
import { Drafts } from "../drafts/drafts";
import { Restaurants } from "../restaurants/restaurants";
import { TaxRates } from "../tax_rates/tax-rates";
import { Invoices } from "./invoices";

Meteor.methods({
  "invoices.insert"(invoice, draft_id) {
    return Invoices.insert({ draft_id, invoice });
  },
  async "invoices.fetch"(draft_id) {
    check(draft_id, String);
    const Stripe = require("stripe")(Meteor.settings.private.stripe_sk);
    const user = Meteor.user();
    const draft = Drafts.findOne(draft_id);

    const restaurant = Restaurants.findOne(draft.restaurant_id);
    const taxes = TaxRates.find({
      "event.account": restaurant.stripe_id,
    });
    let activeTaxArray = [];
    taxes.forEach((tax) => {
      console.log({ tax });
      if (tax.event.data.object.active === true) {
        activeTaxArray.push(tax.event.data.object.id);
      }
    });
    console.log({ activeTaxArray });
    if (user) {
      //if we have a local user, we can use that email address to search
      //the connected accounts list of customers to see if this customer
      //already exists in the restaurants customer list, and if not, than
      //clone the user account from the platform to the restaurant
      //
      //This searches for that customer on the restaurant
      const customer = await Stripe.customers.list(
        {
          email: user.emails[0].address,
        },
        {
          // stripeAccount: restaurant.stripe_id,
          stripeAccount: restaurant.stripe_id,
        }
      );
      //check if we found a customer by email
      if (customer.data.length == 0) {
        //If data array has 0 results, no customer exists on the
        //restaurants account, only the platforms, so we should
        //create their payment method, and then attach the customer
        //as a new customer object to the restaurants account
        //
        //Let's get the paymentMethod the platform user set before arriving to this page
        const paymentMethods = await Stripe.customers.listPaymentMethods(
          user.customerId,
          { type: "card" }
        );
        if (paymentMethods.data[0]) {
          //create a payment method on the connect account using the platform's saved payment method
          const paymentMethod = await Stripe.paymentMethods.create(
            {
              customer: user.customerId,
              payment_method: paymentMethods.data[0].id,
            },
            {
              // stripeAccount: restaurant.stripe_id,
              stripeAccount: restaurant.stripe_id,
            }
          );
          const customer = await Stripe.customers.create(
            {
              email: user.emails[0].address,
              payment_method: paymentMethod.id,
              invoice_settings: {
                default_payment_method: paymentMethod.id,
              },
            },
            {
              // stripeAccount: restaurant.stripe_id,
              stripeAccount: restaurant.stripe_id,
            }
          );
          console.log("Customer from invoice.fetch: ", customer);
          //Now retrieve the upcoming invoice, and save it locally
          console.log("CUSTOMER ID: ", customer.id);
          //make sure to change the invoice settings below, too
          const invoice = await Stripe.invoices.retrieveUpcoming(
            {
              customer: customer.id,
              //subscription_billing_cycle_anchor: [future timestamp to anchor the subscription's billing cycle]
              //subscription_start_date
              subscription_default_tax_rates: activeTaxArray,
              subscription_items: draft.items,
            },
            {
              // stripeAccount: restaurant.stripe_id,
              stripeAccount: restaurant.stripe_id,
            }
          );
          //Now save the invoice
          Meteor.call("invoices.insert", invoice, draft_id, (error, result) => {
            if (error) {
              console.error(error);
            } else {
              console.log("Invoice saved: ", result);
              Drafts.update(draft_id, {
                $set: { invoice_id: result, customer_id: customer.id },
              });
            }
          });
        } else {
          //no paymentMethods.data[0]
        }
      } else {
        console.log("WE ALREADY HAVE A CUSTOMER ON THIS CONNECTED ACCOUNT");
        //We found an existing customer account on the restaurants
        //page already
        //make sure to change the invoice call above too
        console.log("CUSTOMER!!!!!!!: ", customer);
        const invoice = await Stripe.invoices.retrieveUpcoming(
          {
            customer: customer.data[0].id,
            //subscription_billing_cycle_anchor: [future timestamp to anchor the subscription's billing cycle]
            //subscription_start_date
            subscription_default_tax_rates: activeTaxArray,
            subscription_items: draft.items,
          },
          {
            // stripeAccount: restaurant.stripe_id,
            stripeAccount: restaurant.stripe_id,
          }
        );
        Meteor.call("invoices.insert", invoice, draft_id, (error, result) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Invoice saved: ", result);
            Drafts.update(draft_id, {
              $set: { invoice_id: result, customer_id: customer.id },
            });
          }
        });
      }
    } else {
      //TODO: Handle user not logged in here
      //somehow user got her not logged in, should return them to the login/signup page
      console.error("No user found");
    }
  },
});
