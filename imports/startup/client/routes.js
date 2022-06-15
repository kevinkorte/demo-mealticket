import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { FlowRouterTitle } from "meteor/ostrio:flow-router-title";
import { Accounts } from "meteor/accounts-base";
import { Tracker } from "meteor/tracker";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
// Import needed templates
import "../../ui/layouts/body/body.js";
import "../../ui/pages/home/home.js";
import "../../ui/pages/not-found/not-found.js";
import { ready } from "jquery";

const superAdminRoute = FlowRouter.group({
  prefix: "/admin",
  name: "admin",
  waitOn() {
    return Meteor.subscribe("roles");
  },
  triggersEnter: [
    (context, redirect) => {
      console.log(Meteor.userId());
      const isSuperAdmin = Roles.userIsInRole(Meteor.userId(), "super-admin");
      console.log({ isSuperAdmin });
      if (isSuperAdmin) {
        FlowRouter.go(context.path);
      } else {
        redirect("App.home");
      }
    },
  ],
});

const restaurantRoute = FlowRouter.group({
  prefix: "/restaurant",
  name: "restaurant",
  waitOn() {
    return [Meteor.subscribe("roles"), Meteor.subscribe("me")];
  },
  triggersEnter: [
    (context, redirect) => {
      const user = Meteor.user();
      const isOwner = Roles.userIsInRole(
        Meteor.userId(),
        "owner",
        user.restaurant_id
      );
      if (isOwner) {
        FlowRouter.go(context.path);
      } else {
        redirect("App.home");
      }
    },
  ],
});

// Set up all routes in the app
FlowRouter.route("/", {
  name: "App.home",
  title: "Mealticket",
  triggersEnter: [
    (context) => {
      if (context.queryParams.loginToken != undefined) {
        Meteor.call(
          "accounts.isUserSuperAdminByEmail",
          context.queryParams.selector,
          (error, result) => {
            if (error) {
              console.error(error);
            } else {
              //Call returns true or false
              if (result) {
                //User is super-admin
                FlowRouter.go("Admin.dashboard");
              }
            }
          }
        );
      }
    },
  ],
  action() {
    this.render("App_body", "App_home");
  },
});

FlowRouter.route("/login", {
  name: "App.login",
  waitOn() {
    return [
      import("../../ui/layouts/empty/body"),
      import("../../ui/pages/login/login"),
    ];
  },
  action() {
    this.render("Empty_layout", "Page_login");
  },
});

// FlowRouter.route("/home", {
//   name: "App.home",
//   waitOn() {
//     return [
//       import("../../ui/layouts/body"),
//       import("../../ui/pages/home/home"),
//     ];
//   },
//   action() {
//     this.render("App_body", "App_home");
//   },
// });

FlowRouter.route("/restaurants", {
  name: "App.restaurants",
  title: "Restaurants | Mealticket",
  waitOn() {
    return [
      import("../../ui/layouts/body/body"),
      import("../../ui/pages/restaurants/restaurants"),
    ];
  },
  action() {
    if (true) {
      this.render("App_body", "Page_restaurants");
    }
  },
});

FlowRouter.route("/restaurant/:slug_id/:slug", {
  //Route name is used in components/signup/signup.js to handle signup action
  //Changing this route name will break signup handler functionality
  name: "App.restaurant",
  triggersEnter: [
    (context, redirect) => {
      document.body.classList.add("body-bg");
    },
  ],
  waitOn() {
    return [
      import("../../ui/layouts/body/body"),
      import("../../ui/pages/restaurant/restaurant"),
    ];
  },
  action() {
    this.render("App_body", "Page_restaurant");
  },
});

FlowRouter.route("/review", {
  name: "App.review",
  waitOn() {
    return [
      import("../../ui/layouts/body/body"),
      import("../../ui/pages/review/review"),
    ];
  },
  action() {
    this.render("App_body", "Page_review");
  },
});

FlowRouter.route("/subscriptions", {
  name: "App.subscriptions",
  waitOn() {
    return [import("../../ui/pages/subscriptions/subscriptions")];
  },
  action() {
    this.render("App_body", "Page_subscriptions");
  },
});

FlowRouter.route("/invitation/:token", {
  name: "App.invitation",
  waitOn() {
    return [
      import("../../ui/layouts/empty/body"),
      import("../../ui/pages/invitation/invitation"),
    ];
  },
  action() {
    this.render("Empty_layout", "Page_invitation");
  },
});

FlowRouter.route("/confirmation", {
  name: "App.confirmation",
  waitOn() {
    return [import("../../ui/pages/confirmation/subscription-confirmation")];
  },
  action() {
    this.render("App_body", "Page_subscription_confirmation");
  },
});

FlowRouter.route("/login/:id", {
  name: "Admin.login",
  waitOn() {
    return [
      import("../../ui/layouts/empty/body"),
      import("../../ui/pages/login/admin-login"),
    ];
  },
  action() {
    this.render("Empty_layout", "Admin_login");
  },
});

FlowRouter.route("/signup", {
  //Route name is used in components/signup/signup.js to handle signup action
  //Changing this route name will break signup handler functionality
  name: "App.signup",
  waitOn() {
    return [
      import("../../ui/layouts/empty/body"),
      import("../../ui/pages/signup/signup"),
    ];
  },
  action() {
    this.render("Empty_layout", "Page_signup");
  },
});
//FIXME: Handle multiple settings routes "/restaurant/settings" and "/settings" with logic
restaurantRoute.route("/settings", {
  name: "Restaurant.settings",
  waitOn() {
    return [
      import("../../ui/layouts/restaurant/body"),
      import("../../ui/pages/settings/settings-restaurant"),
      Meteor.subscribe("me"),
    ];
  },
  action() {
    const user = Meteor.user();
    if (user.account_type == "restaurant") {
      this.render("Layout_restaurant", "Page_settings_restaurant");
    }
  },
});

FlowRouter.route("/settings", {
  name: "User.settings",
  waitOn() {
    return [
      import("../../ui/layouts/body/body"),
      import("../../ui/pages/settings/settings-user"),
    ];
  },
  action() {
    this.render("App_body", "Page_user_settings");
  },
});

restaurantRoute.route("/quickstart", {
  name: "Restaurant.quickstart",
  waitOn() {
    return [
      import("../../ui/layouts/restaurant/body"),
      import("../../ui/pages/quickstart/restaurant-quickstart"),
    ];
  },
  action() {
    this.render("Layout_restaurant", "Page_restaurant_quickstart");
  },
});

superAdminRoute.route("/dashboard", {
  //Route: /admin/dashboard
  name: "Admin.dashboard",
  waitOn() {
    return [
      import("../../ui/layouts/admin/body"),
      import("../../ui/pages/admin/dashboard"),
    ];
  },
  action() {
    this.render("Admin_layout", "Admin_dashboard");
  },
});

// FlowRouter.notFound = {
//   action() {
//     this.render("App_body", "App_notFound");
//   },
// };

//Initialize FlowRouterTitle class by passing FlowRouter object. Right after creating all routes:
new FlowRouterTitle(FlowRouter);
