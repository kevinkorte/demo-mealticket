import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import Swal from "sweetalert2";
import "./restaurant-card.html";

Template.restaurant_card.onCreated(function () {
  // this.autorun(() => {
  //   this.subscribe("users.all");
  // });
});

Template.restaurant_card.helpers({
  getOwnerEmail(ownerId) {
    const user = Meteor.users.findOne(ownerId);
    return user.emails[0].address;
  },
  checkIfOpen(status) {
    //status is the boolean value of "open"
    if (status) {
      return '<span class="badge bg-success">Yes</span>';
    } else {
      return '<span class="badge bg-warning text-dark">No</span>';
    }
  },
});

Template.restaurant_card.events({
  "click #invite-btn"(event) {
    console.log(this);
    Meteor.call("accounts.sendEnrollmentEmail", this.owner_id, (error) => {
      if (error) {
        console.error(error);
        Swal.fire({
          title: error.reason,
          text: error.message,
          icon: "error",
          toast: true,
          position: "bottom",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          iconColor: "white",
          customClass: {
            popup: "colored-toast",
          },
        });
      } else {
        console.log("Sent");
      }
    });
  },
  "click #restaurant-delete"() {
    console.log(this);
  },
});
