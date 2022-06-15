const stripe = require("stripe")(Meteor.settings.private.stripe_sk);
// const bound = Meteor.bindEnvironment((callback) => callback());
const bodyParser = require("body-parser");

// Listen to incoming HTTP requests (can only be used on the server).
// WebApp.connectHandlers.use(
//   "/webhook/stripe",
//   bodyParser.raw({ type: "application/json" })
// );
WebApp.connectHandlers
  .use(bodyParser.raw({ type: "application/json" }))
  .use("/webhook/stripe", (req, res, next) => {
    const endpointSecret = Meteor.settings.private.stripe_whsec;
    if (endpointSecret) {
      const sig = req.headers["stripe-signature"];
      let event;
      try {
        console.log("INSIDE THE TRY BLOCK");
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (error) {
        console.error(error);
        res.writeHead(400).end(`Webhook Error ${error.message}`);
      }
      switch (event.type) {
        case "product.created":
          //payload = event.data.object;
          //keeping event gives us the connected account id

          Meteor.call("products.insert", event, (error) => {
            if (error) {
              console.error(error);
            }
          });
          break;
        case "plan.created":
          //payload = event.data.object;
          //keeping event gives us the connected account id

          Meteor.call("plans.insert", event, (error) => {
            if (error) {
              console.error(error);
            }
          });
          // console.log({ plan });
          break;
        case "price.created":
          //payload = event.data.object;
          //keeping event gives us the connected account id

          Meteor.call("prices.insert", event, (error) => {
            if (error) {
              console.error(error);
            }
          });
          break;
        case "tax_rate.created":
          Meteor.call("taxRates.insert", event, (error) => {
            if (error) {
              console.error(error);
            }
          });
          break;
        case "tax_rate.updated":
          Meteor.call("taxRates.update", event, (error) => {
            if (error) {
              //TODO: Handle error
              console.error(error);
            }
          });
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      res.writeHead(200).end("Webhook received to Mealticket");
    }
  });
