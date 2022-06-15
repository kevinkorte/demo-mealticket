import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";
import { Session } from "meteor/session";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { Tracker } from "meteor/tracker";
import "./restaurant.html";
import "../../components/product/product";
import "../../components/signup/signup";
import { Restaurants } from "../../../api/restaurants/restaurants";
import { Prices } from "../../../api/prices/prices";
import { Products } from "../../../api/products/products";
import { TaxRates } from "../../../api/tax_rates/tax-rates";
import dayjs from "dayjs";
import bootstrap from "bootstrap";
import Swal from "sweetalert2";
import { bottom } from "@popperjs/core";

Template.Page_restaurant.onCreated(function () {
  this.autorun(() => {
    this.subscribe("restaurants.all");
    this.subscribe("prices.all");
    this.subscribe("products.all");
    this.subscribe("taxRates.all");
  });
});

Template.Page_restaurant.helpers({
  buttonText() {
    if (Meteor.user()) {
      return "Preview reoccurring order";
    } else {
      return "Sign up or login";
    }
  },
  hasError() {
    const errorExists = Session.get("hasError");
    if (errorExists) {
      return true;
    } else {
      return false;
    }
  },
  readError() {
    return Session.get("errorMsg");
  },
  getSubtotal() {
    const cents = Session.get("cost");
    if (cents == undefined) {
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: "USD",
      }).format(0);
    } else {
      const dollars = cents / 100;
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: "USD",
      }).format(dollars);
    }
  },
  getTaxTotal(id) {
    const cents = Session.get("cost");
    const tax = TaxRates.findOne(id);
    let tax_percentage = parseFloat(tax.event.data.object.percentage / 100);
    // const percentage = tax.dataset.percentage;
    // console.log({ percentage });
    if (cents == undefined) {
      Session.set("tax", 0);
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: "USD",
      }).format(0);
    } else {
      const dollars = cents / 100;
      const tax_amount = dollars * tax_percentage;
      Session.set("tax", tax_amount);
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: "USD",
      }).format(tax_amount);
    }
  },
  getTotal() {
    const cost = Session.get("cost");
    const tax_dollars = Session.get("tax");
    console.log({ cost });
    // console.log({ tax_dollars });
    if (cost === undefined) {
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: "USD",
      }).format(0);
    } else if (tax_dollars === undefined) {
      const subtotal = cost / 100;
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: "USD",
      }).format(subtotal);
    } else {
      const tax = tax_dollars * 100;
      // console.log({ tax });
      const total = cost + tax;
      const dollars = total / 100;
      return new Intl.NumberFormat("en-us", {
        style: "currency",
        currency: "USD",
      }).format(dollars);
    }
  },
  restaurants() {
    const restaurants = Restaurants.findOne();
    return restaurants;
  },
  getProducts() {
    const products = Products.find();
    const temp = Products.find().fetch();
    // console.log({ temp });
    return products;
  },
  tax() {
    const tax = TaxRates.find();
    if (tax) {
      return tax;
    } else {
      return;
    }
  },
  getTax(id) {
    const tax = TaxRates.findOne(id);
    console.log({ tax });
    // console.log(tax.event.data.object);
  },
  taxName(id) {
    const tax = TaxRates.findOne(id);
    if (tax) {
      return tax.event.data.object.display_name;
    } else {
      return;
    }
  },
  taxPercent(id) {
    const tax = TaxRates.findOne(id);
    if (tax) {
      return tax.event.data.object.percentage;
    } else {
      return;
    }
  },
  taxIsActive(id) {
    const tax = TaxRates.findOne(id);
    if (typeof tax.event.data != undefined) {
      const status = tax.event.data.object.active;
      if (status) {
        return true;
      } else {
        return;
      }
    } else {
      return;
    }
  },
  nextPickup(dayOfWeek) {
    //this is now, duh!
    const now = dayjs();
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
    let pickupDate = dayjs().day(targetDay);
    //Compare now against the pickupDate
    //If pickupDate is in past, add 7 days (next week)
    let isNowBeforePickup = dayjs().isBefore(pickupDate);
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
      return dayjs(nextWeek).day(targetDay).format("MMM D");
    } else {
      return dayjs(pickupDate).format("MMM D");
    }
  },
});

Template.Page_restaurant.events({
  "input .qty-input"() {
    const inputs = document.querySelectorAll(".qty-input");
    let cost = 0;
    for (index = 0; index < inputs.length; ++index) {
      // console.log(inputs[index]);
      if (inputs[index].value >= 0) {
        const multiplier = inputs[index].value;
        const price = inputs[index].dataset.cost;
        cost = cost + multiplier * price;
      } else {
        const multiplier = 0;
        const price = inputs[index].dataset.cost;
        cost = cost + multiplier * price;
      }
    }
    console.log({ cost });
    Session.set("cost", cost);
  },
  "submit #order"(event) {
    event.preventDefault();
    //1. Check if frequency and pickup date are selected
    const date = event.target.day.value;
    if (date) {
      console.log("has a date");
    } else {
      Session.set("hasError", true);
      Session.set("errorMsg", "Select a reoccurring day to pickup this order.");
      Swal.fire({
        toast: true,
        position: bottom,
        icon: "error",
        title: "Select a reoccurring day to pickup this order",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
      throw new Meteor.Error(
        "date",
        "Select a reoccurring day to pickup this order."
      );
    }
    Session.set("hasError", null);
    const elements = document.querySelectorAll(".qty-input");
    const restaurant_id = document.getElementById("restaurant-id").value;
    //1. First make sure they are a user - present modal with login page, and link to signup
    const user = Meteor.userId();
    let items = [];
    for (const element of elements) {
      // console.log({ element });
      // console.log(element.dataset.price, ": ", element.value);
      if (element.value > 0) {
        items.push({ price: element.dataset.price, quantity: element.value });
      }
    }

    if (user) {
      //means we have a user id
      // console.log({ user });
      Meteor.call(
        "drafts.insert",
        restaurant_id,
        date,
        items,
        (error, result) => {
          if (error) {
            //TODO: Handle error
            console.error(error);
          } else {
            //Go to draft page
            FlowRouter.go("App.review", {}, { order: result });
          }
        }
      );
    } else {
      //we have no user

      Meteor.call(
        "drafts.insert",
        restaurant_id,
        date,
        items,
        (error, result) => {
          if (error) {
            //TODO: Handle error
            console.error(error);
          } else {
            console.log({ result });
            FlowRouter.go("App.signup", {}, { next: result });
          }
        }
      );
    }

    //2. Check frequency is selected
    //3. Check the pickup date
    //4. Gather order number and send it off to stripe for to preview the invoice
  },
});
