// Methods related to drafts

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Drafts } from "./drafts.js";
import dayjs, { tz } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Invoices } from "../invoices/invoices.js";
dayjs.extend(utc);
dayjs.extend(timezone);

Meteor.methods({
  "drafts.insert"(restaurant_id, date, items) {
    const timestamp = nextPickup(date);
    console.log({ timestamp });
    const draft = Drafts.insert({
      restaurant_id,
      items,
      anchor: timestamp,
      createdAt: new Date(),
    });
    return draft;
  },
  "drafts.findOne"(id) {
    const draft = Drafts.findOne(id);
    return Invoices.findOne(draft.invoice_id);
  },
  // async "drafts.fetch"(id) {
  //   const stripe = require("stripe")(Meteor.settings.private.stripe_sk);
  //   const draft = Drafts.findOne(id);
  //   const user = Meteor.user();
  //   //Clone the customer
  //   if (user) {
  //     const customers = await stripe.customers.list(
  //       {
  //         email: user.emails[0].address,
  //       },
  //       { stripeAccount: "acct_1KhLNVPg3aL0wGFv" }
  //     );
  //     if (customers.data.length == 0) {
  //       //no customers found
  //       console.log("NO USERS FOUND");
  //       const paymentMethods = await stripe.customers.listPaymentMethods(
  //         user.customerId,
  //         { type: "card" }
  //       );
  //       if (paymentMethods.data[0]) {
  //         const paymentMethod = await stripe.paymentMethods.create(
  //           {
  //             customer: user.customerId,
  //             payment_method: paymentMethods.data[0].id,
  //           },
  //           {
  //             stripeAccount: "acct_1KhLNVPg3aL0wGFv",
  //           }
  //         );
  //         const customer = await stripe.customers.create(
  //           {
  //             email: user.emails[0].address,
  //             payment_method: paymentMethod.id,
  //           },
  //           {
  //             stripeAccount: "acct_1KhLNVPg3aL0wGFv",
  //           }
  //         );
  //         // console.log({ customer });
  //         const invoice = await stripe.invoices.retrieveUpcoming(
  //           {
  //             customer: customer.id,
  //             //subscription_billing_cycle_anchor: [future timestamp to anchor the subscription's billing cycle]
  //             //subscription_start_date
  //             subscription_default_tax_rates: ["txr_1Ki4UGPg3aL0wGFvsibWfBOQ"],
  //             subscription_items: [
  //               { price: "price_1KhLnMPg3aL0wGFvBOtjvrtl", quantity: 2 },
  //               { price: "price_1KhLm0Pg3aL0wGFvtag7P1LM", quantity: 2 },
  //             ],
  //           },
  //           { stripeAccount: "acct_1KhLNVPg3aL0wGFv" }
  //         );
  //         console.log({ invoice });
  //         // return invoice;
  //         Meteor.call("invoices.insert", invoice, (error, result) => {
  //           if (error) {
  //             //TODO: Handle error
  //             console.error(error);
  //           } else {
  //             Drafts.update(id, { $set: { invoice_id: result } });
  //           }
  //         });
  //       }
  //     } else {
  //       //customer found
  //       console.log("FOUND A USER");
  //     }
  //   } else {
  //     //TODO: Handle no user on preview page
  //   }
  // },
});

function test(x) {
  return x + 1;
}

function nextPickup(dayOfWeek) {
  //this is now, duh!
  const now = dayjs().tz("America/Los_Angeles");
  //finds Monday of this week 0=Sunday, 6=Saturday
  let targetDay;
  switch (dayOfWeek) {
    case "sunday":
      targetDay = 0;
      break;
    case "monday":
      targetDay = 1;
      break;
    case "tuesday":
      targetDay = 2;
      break;
    case "wednesday":
      targetDay = 3;
      break;
    case "thursday":
      targetDay = 4;
      break;
    case "friday":
      targetDay = 5;
      break;
    case "saturday":
      targetDay = 6;
      break;
    default:
      throw new Meteor.Error("Error", "Can't complete process");
  }
  //find what the date is for our target pickup day (Mon, Tues, etc)
  let pickupDate = dayjs().tz("America/Los_Angeles").day(targetDay);
  //Compare now against the pickupDate
  //If pickupDate is in past, add 7 days (next week)
  let isNowBeforePickup = dayjs()
    .tz("America/Los_Angeles")
    .isBefore(pickupDate);
  //if isNowBeforePickup is false, add 7 days to make it next week;
  if (!isNowBeforePickup) {
    //returned false
    //isNowBeforePickup is not before pickupDate
    //so add 7 days to the first available pickupDate
    pickupDate = dayjs(pickupDate).add(7, "day");
  }
  //Now we need to check if pickupDate is withing 3 days of now
  //and if so, push it out to the next pickup day
  //
  //Let's fast forward today by 3 days (72 hours)
  const timelineCheck = now.add(3, "day");
  //and compare the new "now" to the expected pickup date
  const enoughTime = timelineCheck.isAfter(pickupDate);
  //if the new "now" is after the pickup date than we are within the 3 day window
  if (enoughTime) {
    //push out pickupDate to next week's correct date
    const nextWeek = dayjs(pickupDate).add(7, "day");
    return (
      dayjs(nextWeek)
        .day(targetDay)
        //TODO: Make this dynamic
        .tz("America/Los_Angeles")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .unix()
    );
  } else {
    return (
      dayjs(pickupDate)
        //TODO: Make this dynamic
        .tz("America/Los_Angeles")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .unix()
    );
  }
}
