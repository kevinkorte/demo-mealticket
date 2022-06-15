import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Loader } from "@googlemaps/js-api-loader";
import { Blaze } from "meteor/blaze";
import "./restaurant-quickstart.html";
import "../../components/restaurant/details-form";

Template.Page_restaurant_quickstart.onRendered(function () {
  const loader = new Loader({
    apiKey: Meteor.settings.public.google_places_key,
    version: "weekly",
    libraries: ["places"],
  });
  loader.load().then(() => {
    const input = document.getElementById("restaurant-input");
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      console.log({ place });
      Meteor.call("restaurants.saveDetails", place, (error, result) => {
        if (error) {
          //TODO: Handle error
          console.error(error);
        } else {
          //Flowrouter.go to the next page
        }
      });
      // const address1Input = document.getElementById("address1");
      // if (address1Input) {
      //   //Element doesn't exists, so template hasn't been loaded
      //   handledPlaceChange(place);
      // } else {
      //   const renderedView = Blaze.renderWithData(
      //     Template.Component_restaurant_details_form,
      //     { place },
      //     document.getElementById("restaurant-details")
      //   );

      // handledPlaceChange(place);
      // }
    });
  });
});

Template.Page_restaurant_quickstart.events({
  "submit #restaurant-name-form"(event) {
    event.preventDefault();
  },
});

function handledPlaceChange(place) {
  const address1Input = document.getElementById("address1");
  const restaurantNameInput = document.getElementById("restaurant-input");
  restaurantNameInput.value = place.name;
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
        document.getElementById("address2").value = component.short_name;
        break;
      }
      case "locality":
        document.getElementById("city").value = component.long_name;
        break;
      case "administrative_area_level_1":
        document.getElementById("state").value = component.short_name;
        break;
      case "postal_code":
        document.getElementById("zipcode").value = component.long_name;
        break;
    }
  }
  address1Input.value = address1;
}
