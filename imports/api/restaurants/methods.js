import { Restaurants } from "./restaurants";

Meteor.methods({
  async "restaurants.getPrices"(stripe_acct_id) {
    const stripe = require("stripe")(Meteor.settings.private.stripe_sk);
    const prices = await stripe.prices.list({
      stripeAccount: stripe_acct_id,
    });
    return prices;
  },
  // async "restaurants.getProductName"(productId) {
  //   const stripe = require("stripe")(Meteor.settings.private.stripe_sk);
  //   const product = await stripe.products.retrieve(productId, {
  //     stripeAccount: "acct_1KIz9YPZDKmW0g4C",
  //   });
  //   return product;
  // },
  "restaurants.saveNameOnly"() {
    //Did not use an option for the Google places dropdown
  },
  "restaurants.saveDetails"(place) {
    //Selected an option from the Google places dropdown so save all the details and then we'll confirm them
    let address1 = "";
    let address2 = "";
    let city = "";
    let state = "";
    let zipcode = "";
    for (const component of place.address_components) {
      const componentType = component.types[0];
      switch (componentType) {
        case "street_number": {
          address1 = `${component.long_name} ${address1}`;
          break;
        }
        case "route": {
          address1 += component.short_name;
          break;
        }
        case "subpremise": {
          address2 = component.short_name;
          break;
        }
        case "locality":
          city = component.long_name;
          break;
        case "administrative_area_level_1":
          state = component.short_name;
          break;
        case "postal_code":
          zipcode = component.long_name;
          break;
      }
    }
    console.log(zipcode);
  },
});
