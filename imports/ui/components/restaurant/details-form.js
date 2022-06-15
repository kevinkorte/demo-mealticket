import { Template } from "meteor/templating";
import "./details-form.html";

// Template.Component_restaurant_details_form.onRendered(function () {
//   const address1Input = document.getElementById("address1");
//   //   const cityInput = document.getElementById("city");
//   const place = Blaze.getData();
//   let address1 = "";
//   console.log(place.place);
//   for (const component of place.place.address_components) {
//     const componentType = component.types[0];
//     console.log({ componentType });
//     switch (componentType) {
//       case "street_number": {
//         address1 = `${component.long_name} ${address1}`;
//         break;
//       }
//       case "route": {
//         address1 += component.short_name;
//         break;
//       }
//       case "subpremise": {
//         document.getElementById("address2").value = component.short_name;
//         break;
//       }
//       case "locality":
//         document.getElementById("city").value = component.long_name;
//         break;
//       case "administrative_area_level_1":
//         document.getElementById("state").value = component.long_name;
//         break;
//       case "postal_code":
//         document.getElementById("zipcode").value = component.long_name;
//         break;
//     }
//   }
//   address1Input.value = address1;
// });
