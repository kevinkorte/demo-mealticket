import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import "./new-restaurant-form.html";

Template.new_restaurant_form.events({
  "submit #new-restaurant"(event) {
    event.preventDefault();
    const email = event.target.email.value;
    Meteor.call("accounts.adminCreateRestaurant", email, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Created Restaurant Successfully");
      }
    });
  },
});
