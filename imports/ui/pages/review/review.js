import "./review.html";
import "../../components/review/business";
import "../../components/review/invoice";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { Drafts } from "../../../api/drafts/drafts";
import { Loader } from "@googlemaps/js-api-loader";
import { Invoices } from "../../../api/invoices/invoices";
import { Restaurants } from "../../../api/restaurants/restaurants";
import { TaxRates } from "../../../api/tax_rates/tax-rates";
import { ReactiveVar } from "meteor/reactive-var";
import dayjs from "dayjs";

Template.Page_review.onCreated(function () {
  const draft_id = FlowRouter.getQueryParam("order");
  if (draft_id) {
    this.autorun(() => {
      this.subscribe("drafts.find", draft_id);
      this.subscribe("invoices.findOne", draft_id);
      this.subscribe("taxRates.all");
    });
  } else {
    //TODO: Show error that we last the draft id. Return user to restaurant page
  }

  this.autorun(() => {
    const draft = Drafts.findOne(draft_id);
    if (draft) {
      if (draft.invoice_id) {
        console.log("has invoice: ", draft.invoice_id);
      } else {
        console.log("no invoice");
        //invoice has not been created yet.
        //ask stripe for one and save the invoice id to the draft document
        //take logic from draft.fetch method and move to invoice.fetch
        Meteor.call("invoices.fetch", draft_id, (error, result) => {
          if (error) {
            //TODO: Handle error
            console.error(error);
          } else {
            console.log({ result });
          }
        });
      }
    }
  });
  this.paymentMethod = new ReactiveVar(null);
  this.autorun(() => {
    Meteor.call("subscriptions.getPaymentMethods", (error, result) => {
      if (error) {
        console.error(error);
      } else {
        console.log(result.data[0]);
        this.paymentMethod.set(result.data[0]);
      }
    });
  });
});

Template.Page_review.onRendered(function () {
  const loader = new Loader({
    apiKey: Meteor.settings.public.google_public_key,
    version: "weekly",
    libraries: ["places"],
  });
  this.autorun(() => {
    if (Template.instance().subscriptionsReady()) {
      loader.load().then(() => {
        const center = { lat: 46.21026514211688, lng: -119.22495769438267 };
        const map = new google.maps.Map(document.getElementById("map"), {
          center: center,
          zoom: 15,
        });
        const marker = new google.maps.Marker({
          position: center,
          map: map,
        });
      });
    }
  });
});

Template.Page_review.helpers({
  draft() {
    return Drafts.findOne();
  },
  showPickupDate(unix) {
    return dayjs.unix(unix).format("dddd, MMMM D");
  },
  showDay(unix) {
    return dayjs.unix(unix).format("dddd");
  },
  taxes() {
    const taxes = TaxRates.find();
    taxes.forEach((tax) => {
      console.log({ tax });
    });
  },
  restaurant() {
    const invoice = Invoices.findOne();
    console.log({ invoice });
    const draft = Drafts.findOne();
    console.log({ draft });
    return Drafts.findOne();
  },
  invoice() {
    console.log(Invoices.findOne());
    return Invoices.findOne();
  },
  fetchInvoice(invoice_id) {
    console.log(invoice_id);
    return Invoices.findOne(invoice_id);
    // const draft_id = FlowRouter.getQueryParam("review");
    // Meteor.call("drafts.findOne", draft_id, (error, result) => {
    //   if (error) {
    //     //TODO: Handle error
    //     console.error(error);
    //   } else {
    //     console.log({ result });
    //     return result;
    //   }
    // });
  },
  showInvoice(result) {
    console.log({ result });
    return result;
  },
  getPaymentMethods() {
    return Template.instance().paymentMethod.get();
  },
  showIcon(brand) {
    console.log(brand);
  },
});

Template.Page_review.events({
  "click #btn"(event) {
    event.preventDefault();
    console.log("click");
    const draft_id = FlowRouter.getQueryParam("order");
    Meteor.call("subscriptions.start", draft_id, (error, result) => {
      if (error) {
        //TODO: Handle error
        console.error(error);
      } else {
        console.log("Result: ", result);
        FlowRouter.go("App.confirmation", {}, { subscription: result });
      }
    });
  },
});
