const removeBtns = document.querySelectorAll(".remove-from-cart");
const checkOutBtn = document.querySelector(".check-out-btn");
const bitcoinBtn = document.querySelector(".bitcoin-check-out");

//get visitor on page load
const getVisitor = async () =>{

  const visitor = await fetch('https://ipinfo.io/json?token=');
const visitorInfo = await visitor.json()
console.log(visitorInfo);
   let ip = visitorInfo.ip;
  let city = visitorInfo.city;
  let country = visitorInfo.country;
  // let isVpn = visitorInfo.isVpn;
// // let isProxy = visitor.data.privacy.proxy;
  let postal = visitorInfo.postal;
  let region = visitorInfo.region;
  let userAgent = navigator.userAgent;
let pagesVisited = window.location.href


const visit = {
  ip: ip, 
pagesVisited: pagesVisited, 
city: city, 
country: country, 
// isVpn: isVpn, 
// isProxy: isProxy, 
postal: postal, 
region: region,
userAgent: userAgent,
};

const sendVisit = await fetch(window.location.origin + '/visitor', {
method: "POST",
headers:{
  "Content-Type": "application/json"
},
body: JSON.stringify(visit)
});
}
document.addEventListener("DOMContentLoaded", getVisitor);


//credit card processing function
const appId = 'APP.ID';
const locationId = 'AP.ID';

async function initializeCard(payments) {
  const card = await payments.card();
  await card.attach('#card-container');

  return card;
}

async function createPayment(token, verificationToken) {


//if billing country and delivery country not the same throw error and leave message to user
  if(document.getElementById("country-form-select-delivery").value !== document.getElementById("country-form-select-billing").value){
Toastify({
  text: "Error Billing Country & Delivery Country Must Be The Same!",
  duration: 4000,
  position: 'center', // `left`, `center` or `right`
  backgroundColor: "linear-gradient(to right, red, orange)",
  stopOnFocus: true, // Prevents dismissing of toast on hover

}).showToast();
throw Error;
  }

  let customerInfoObj = {
    userEmail : document.getElementById('delivery-email').value.trim(),
First: document.getElementById("delivery-first-name").value.trim(),
Last : document.getElementById('delivery-last-name').value.trim(),
Phone : document.getElementById('delivery-phone').value.trim(),
Address : document.getElementById("delivery-address").value.trimEnd(),
Apartment : document.getElementById("delivery-apartment").value,
State : document.getElementById('delivery-state-region').value.trimEnd(),
City : document.getElementById("delivery-town").value.trim().trimEnd(),
Country : document.getElementById("country-form-select-delivery").value,
Zip : document.getElementById("delivery-zip").value.trim(),
};

  const cart = await fetch(window.location.origin + '/cart'); //get the current cart items from session 
let currentCart = await cart.json();
let serverObj = {}; // object that will be sent back to server
let cartArr = []; // create empty cart object for items
for(let i = 0; i < currentCart.length; i++){ // add each object to the array with name, quantity and price
  let obj = { name: "Watch", quantity: '1', 
  basePriceMoney: {amount: Number(String(currentCart[i].product.price)), //add two zeros behind for squares converstion and them turn it back to number
    currency: 'USD'}
  };
    cartArr.push(obj);
}
serverObj.products = cartArr; // add cartArr to products in serverObj
serverObj.email = document.getElementById('delivery-email').value.trim(); // add users email to email in serverObj before sending to server for processing
serverObj.customer = customerInfoObj; // add customer object to object that is being sent to server
// console.log(cartArr);

let sum = 0;
const getTotal = () =>{ // get total price of the products from cart
  for(let i = 0; i < currentCart.length; i++){
  sum += Number(currentCart[i].product.price);
  }
  return sum;
};
serverObj.total = `${String(getTotal())}`;


  const body = JSON.stringify({
    locationId,
    sourceId: token,
    verificationToken,
    idempotencyKey: window.crypto.randomUUID(),
    customerOrder: serverObj
  });

  const paymentResponse = await fetch('/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (paymentResponse.ok) {
    return paymentResponse.json();
  }

  const errorBody = await paymentResponse.text();
  throw new Error(errorBody);
}

async function tokenize(paymentMethod) {
  const tokenResult = await paymentMethod.tokenize();
  if (tokenResult.status === 'OK') {
    return tokenResult.token;
  } else {
    let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
    if (tokenResult.errors) {
      errorMessage += ` and errors: ${JSON.stringify(
        tokenResult.errors
      )}`;
    }

    throw new Error(errorMessage);
  }
}



// Required in SCA Mandated Regions: Learn more at https://developer.squareup.com/docs/sca-overview
async function verifyBuyer(payments, token) {
//get customer details here and use regex to make sure proper input is entered


const billingFirst = document.getElementById("billing-first-name").value.trim();
  const billingLast = document.getElementById('billing-last-name').value.trim();
  const billingPhone = document.getElementById('billing-phone').value.trim();
  const billingAddress = document.getElementById("billing-address").value.trimEnd();
  const billingApartment = document.getElementById("billing-apartment").value.trimEnd();
  const billingCity = document.getElementById("billing-city-town").value.trimEnd();
  const billingState = document.getElementById('billing-state-region').value.trimEnd();
  const billingCountry = document.getElementById("country-form-select-delivery").value;
  const billingZip = document.getElementById("billing-zip").value.trim();
  
//   // delivery user input
  const userEmail = document.getElementById('delivery-email').value.trim();
  const deliveryFirst = document.getElementById("delivery-first-name").value.trim();
  const deliveryLast = document.getElementById('delivery-last-name').value.trim();
  const deliveryPhone = document.getElementById('delivery-phone').value.trim();
  const deliveryAddress = document.getElementById("delivery-address").value.trimEnd();
  const deliveryApartment = document.getElementById("delivery-apartment").value.trimEnd();
  const deliveryState = document.getElementById('delivery-state-region').value.trimEnd();
  const deliveryCity = document.getElementById("delivery-town").value.trim();
  const deliveryCountry = document.getElementById("country-form-select-delivery").value;
  const deliveryZip = document.getElementById("delivery-zip").value.trim();

  const addressReg = /^[a-zA-Z0-9\s]+$/; // sanitization for address
  const charReg = /^[a-zA-Z]+$/; // sanitzation for only characters
  const digitReg = /^[0-9]{10,12}$/; // sanitzation for only numbers, 10 -12 digits for valid phone numbers
  const zipReg = /^[0-9]{5,10}/ // sanitization for zipcode
const emailReg = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // sanitization for email




   /*
   * Below each statement test if an input is blank, it also does sanitization to make sure only characters or numbers are
   * entered. It also checks to see if billing and delivery are the same
   */


        if(!emailReg.test(userEmail)){ // sanitize emails to make sure emails are valid format
          Toastify({
            text: "Please Enter A valid Email! ex. markjones@gmail.com",
            duration: 8000,
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, red, orange)",
            stopOnFocus: true, // Prevents dismissing of toast on hover
          
          }).showToast();
      throw Error;
        }



      if(billingFirst === "" || deliveryFirst === "" || !charReg.test(billingFirst) || !charReg.test(deliveryFirst) || (deliveryFirst !== billingFirst)) { 
        Toastify({
          text: "Error! Ensure Billing First Name and Delivery First Name Are The Same! No special characters allowed.",
          duration: 8000,
          position: 'center', // `left`, `center` or `right`
          backgroundColor: "linear-gradient(to right, red, orange)",
          stopOnFocus: true, // Prevents dismissing of toast on hover
        
        }).showToast();
      throw Error;
      };


    if(billingLast === "" || deliveryLast === "" || !charReg.test(billingLast) || !charReg.test(deliveryLast) || (deliveryLast !== billingLast)) { 
      Toastify({
        text: "Error! Ensure Billing Last Name and Delivery Last Name Are The Same! No special characters allowed.",
        duration: 8000,
        position: 'center', // `left`, `center` or `right`
        backgroundColor: "linear-gradient(to right, red, orange)",
        stopOnFocus: true, // Prevents dismissing of toast on hover
      
      }).showToast();
      throw Error;
          };

      if(billingPhone === "" || deliveryPhone === "" || !digitReg.test(billingPhone) || !digitReg.test(deliveryPhone) || (billingPhone !== deliveryPhone)) { 
        Toastify({
          text: "Error! Ensure Billing Phone Number and Delivery Phone Number Are The Same! Only Numbers allowed.",
          duration: 8000,
          position: 'center', // `left`, `center` or `right`
          backgroundColor: "linear-gradient(to right, red, orange)",
          stopOnFocus: true, // Prevents dismissing of toast on hover
        
        }).showToast();
        throw Error;
            };

      if(billingAddress === "" || deliveryAddress === "" || !addressReg.test(deliveryAddress) || !addressReg.test(billingAddress) || (deliveryAddress !== billingAddress)) { 
        Toastify({
          text: "Error! Ensure Billing Address and Delivery Address Are The Same! No special characters allowed.",
          duration: 8000,
          position: 'center', // `left`, `center` or `right`
          backgroundColor: "linear-gradient(to right, red, orange)",
          stopOnFocus: true, // Prevents dismissing of toast on hover
        
        }).showToast();
        throw Error;
            };

            if(deliveryApartment == "" && billingApartment == ""){
                //do nothing and move to next statement because deliveryApartment and billingApartment can be blank
            } else if(!addressReg.test(billingApartment) || !addressReg.test(deliveryApartment) || (deliveryApartment !== billingApartment) ){
              Toastify({
                text: "Error! Ensure Billing Apartment and Delivery Apartment Are The Same or Leave It Blank!",
                duration: 8000,
                position: 'center', // `left`, `center` or `right`
                backgroundColor: "linear-gradient(to right, red, orange)",
                stopOnFocus: true, // Prevents dismissing of toast on hover
              
              }).showToast();
                throw Error;
            }
        
        if(billingCity === "" || deliveryCity === "" || !addressReg.test(deliveryCity) || !addressReg.test(billingCity) || (deliveryCity!== billingCity)) { 
          Toastify({
            text: "Error! Ensure Billing City and Delivery City Are The Same!",
            duration: 8000,
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, red, orange)",
            stopOnFocus: true, // Prevents dismissing of toast on hover
          
          }).showToast();
        throw Error;
              };

              if(billingState === "" || deliveryState === "" || !addressReg.test(deliveryState) || !addressReg.test(billingState) || (deliveryState!== billingState)) { 
                Toastify({
                  text: "Error! Ensure Billing State/Region And Delivery State/Region Are The Same!",
                  duration: 8000,
                  position: 'center', // `left`, `center` or `right`
                  backgroundColor: "linear-gradient(to right, red, orange)",
                  stopOnFocus: true, // Prevents dismissing of toast on hover
                
                }).showToast();
                throw Error;
                    };

        if(billingCountry === "Select Country" || deliveryCountry === "Select Country" || !addressReg.test(deliveryCountry) || !addressReg.test(billingCountry) || (deliveryCountry!== billingCountry)) { 
          Toastify({
            text: "Error! Make Sure You Select A Country! Be Sure Billing Country and Delivery Country Are The Same.",
            duration: 8000,
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, red, orange)",
            stopOnFocus: true, // Prevents dismissing of toast on hover
          
          }).showToast();
          throw Error;
              };
      if(billingZip === "" || deliveryZip === "" || !zipReg.test(deliveryZip) || !zipReg.test(billingZip) || (deliveryZip!== billingZip)) { 
        Toastify({
          text: "Error! Ensure Billing Zip Code and Delivery Zip Are The Same!",
          duration: 8000,
          position: 'center', // `left`, `center` or `right`
          backgroundColor: "linear-gradient(to right, red, orange)",
          stopOnFocus: true, // Prevents dismissing of toast on hover
        
        }).showToast();
       throw Error;
            };


let customerInfoObj = {
       userEmail : document.getElementById('delivery-email').value.trim(),
   deliveryFirst : document.getElementById("delivery-first-name").value.trim(),
   deliveryLast : document.getElementById('delivery-last-name').value.trim(),
   deliveryPhone : document.getElementById('delivery-phone').value.trim(),
   deliveryAddress : document.getElementById("delivery-address").value.trimEnd(),
   deliveryState : document.getElementById('delivery-state-region').value.trimEnd(),
 deliveryCity : document.getElementById("delivery-town").value.trim().trimEnd(),
   deliveryCountry : document.getElementById("country-form-select-delivery").value,
   deliveryZip : document.getElementById("delivery-zip").value.trim(),
   };

const cart = await fetch(window.location.origin + '/cart'); //get the current cart items from session 
let currentCart = await cart.json();
// console.log(currentCart);
let serverObj = {}; // object that will be sent back to server
let cartArr = []; // create empty cart object for items
for(let i = 0; i < currentCart.length; i++){ // add each object to the array with name, quantity and price
  let obj = { name: "Watch", quantity: '1', 
  basePriceMoney: {amount: Number(String(currentCart[i].product.price).concat('00')), //add two zeros behind for squares converstion and them turn it back to number
    currency: 'USD'}
  };
    cartArr.push(obj);
}
serverObj.products = cartArr; // add cartArr to products in serverObj
serverObj.email = userEmail; // add users email to email in serverObj before sending to server for processing
serverObj.customer = customerInfoObj; // add customer object to object that is being sent to server
// console.log(cartArr);

let sum = 0;
const getTotal = () =>{ // get total price of the products from cart
  for(let i = 0; i < currentCart.length; i++){
  sum += Number(currentCart[i].product.price);
  }
  return sum;
}





  const verificationDetails = {
    amount: `${getTotal()}`,
    billingContact: {
      addressLines: [`${document.getElementById("billing-address").value.trimEnd()}`, `${document.getElementById("billing-apartment").value}`],
      familyName: `${document.getElementById('billing-last-name').value.trim()}`,
      givenName: `${document.getElementById("billing-first-name").value.trim()}`,
      email: `${document.getElementById('delivery-email').value.trim()}`,
      country: `${document.getElementById("country-form-select-delivery").value}`,
      phone: `${document.getElementById('billing-phone').value.trim()}`,
      region: `${document.getElementById("billing-state-region").value.trim().trimEnd()}`,
      city: `${document.getElementById("billing-city-town").value.trimEnd()}`,
    },
    currencyCode: 'USD',
    intent: 'CHARGE',
  };
  console.log(verificationDetails);

  const verificationResults = await payments.verifyBuyer(
    token,
    verificationDetails
  );
  return verificationResults.token;
}


// status is either SUCCESS or FAILURE;
function displayPaymentResults(status) {
  const statusContainer = document.getElementById(
    'payment-status-container'
  );
  if (status === 'SUCCESS') {
    statusContainer.classList.remove('is-failure');
    statusContainer.classList.add('is-success');
  } else {
    statusContainer.classList.remove('is-success');
    statusContainer.classList.add('is-failure');
  }

  statusContainer.style.visibility = 'visible';
}




document.addEventListener('DOMContentLoaded', async function () {
  if (!window.Square) {
    throw new Error('Square.js failed to load properly');
  }

  let payments;
  try {
    payments = window.Square.payments(appId, locationId);
  } catch {
    const statusContainer = document.getElementById(
      'payment-status-container'
    );
    statusContainer.className = 'missing-credentials';
    statusContainer.style.visibility = 'visible';
    return;
  }

  let card;
  try {
    card = await initializeCard(payments);
  } catch (e) {
    console.error('Initializing Card failed', e);
    return;
  }

  async function handlePaymentMethodSubmission(
event,
paymentMethod,
shouldVerify = true
) {
event.preventDefault();

try {
// disable the submit button as we await tokenization and make a payment
// request.
cardButton.disabled = true;
const token = await tokenize(paymentMethod);
let verificationToken;

if (shouldVerify) {
verificationToken = await verifyBuyer(
  payments,
  token
);
}

// console.debug('Verification Token:', verificationToken);

//TODO: Add the verification token in Step 2.2
const paymentResults = await createPayment(token, verificationToken);
displayPaymentResults('SUCCESS');
Toastify({
  text: "Payment Successful! 🙌 An Email was sent to you! 📧",
  duration: 10000,
  position: 'center',
  className: "info",
  style: {
    background: "linear-gradient(to right, #00b09b, #96c93d)",
  }
}).showToast();

setTimeout(()=>{
window.location.reload();
}, 12000)

console.debug('Payment Success', paymentResults);
} catch (e) {
cardButton.disabled = false;

displayPaymentResults('FAILURE');
Toastify({
  text: "Payment Failed 😕",
  duration: 7000,
  position: 'center', // `left`, `center` or `right`
  backgroundColor: "linear-gradient(to right, red, orange)",
  stopOnFocus: true, // Prevents dismissing of toast on hover

}).showToast();

console.error(e.message);
}
}



  const cardButton = document.getElementById('card-button');
  cardButton.addEventListener('click', async function (event) {
    await handlePaymentMethodSubmission(event, card);
  });
});






//remove item from cart function by id
const removeFromCart = async (e) =>{
    const itemId = {itemId: e.target.parentElement.parentElement.parentElement.id};
    console.log(itemId);
    e.target.parentElement.parentElement.parentElement.innerHTML = "";
    const response = await fetch(window.location.origin + `/remove-from-cart`, {
method: "POST",
headers:{
"Content-Type": "application/json"
},
      body: JSON.stringify(itemId)
    } 
    );
   const serverResponse = await response.json();
   console.log(serverResponse); 
   setTimeout(location.reload(), 2000);
};


removeBtns.forEach(btn=>{
    btn.addEventListener("click", removeFromCart);
});



//bitcoin payment

bitcoinBtn.addEventListener("click", async (e)=>{
  e.preventDefault();
  const userEmail = document.getElementById('delivery-email').value.trim();
  const deliveryFirst = document.getElementById("delivery-first-name").value.trim();
  const deliveryLast = document.getElementById('delivery-last-name').value.trim();
  const deliveryPhone = document.getElementById('delivery-phone').value.trim();
  const deliveryAddress = document.getElementById("delivery-address").value.trimEnd();
  const deliveryState = document.getElementById('delivery-state-region').value.trimEnd();
  const deliveryCity = document.getElementById("delivery-town").value.trim().trimEnd();
  const deliveryApartment = document.getElementById("delivery-apartment").value.trimEnd();
  const deliveryCountry = document.getElementById("country-form-select-delivery").value;
  const deliveryZip = document.getElementById("delivery-zip").value.trim();


  const addressReg = /^[a-zA-Z0-9\s]+$/; // sanitization for address
  const charReg = /^[a-zA-Z0-9\s]+$/; // sanitzation for only characters
  const digitReg = /^[0-9]{10,12}$/; // sanitzation for only numbers, 10 -12 digits for valid phone numbers
  const zipReg = /^[0-9]{5,10}/ // sanitization for zipcode
  const emailReg = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 

  if(!emailReg.test(userEmail)){
    Toastify({
      text: "Enter Valid Email!",
      duration: 8000,
      position: 'center', // `left`, `center` or `right`
      backgroundColor: "linear-gradient(to right, red, orange)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
    
    }).showToast();
    return;
  };

  if(deliveryFirst === "" || !charReg.test(deliveryFirst)){
    Toastify({
      text: "Enter Valid First Name!",
      duration: 8000,
      position: 'center', // `left`, `center` or `right`
      backgroundColor: "linear-gradient(to right, red, orange)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
    
    }).showToast();
    return;
  };

  if(deliveryLast === "" || !charReg.test(deliveryLast)){
    Toastify({
      text: "Enter Valid Last Name!",
      duration: 8000,
      position: 'center', // `left`, `center` or `right`
      backgroundColor: "linear-gradient(to right, red, orange)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
    
    }).showToast();
return;
  };

  if(deliveryPhone === "" || !digitReg.test(deliveryPhone)){
    Toastify({
      text: "Enter Valid Phone Number!",
      duration: 8000,
      position: 'center', // `left`, `center` or `right`
      backgroundColor: "linear-gradient(to right, red, orange)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
    
    }).showToast();
    return;
  };
  if(deliveryAddress === "" || !addressReg.test(deliveryAddress)){
    Toastify({
      text: "Error! Enter A Valid Address!",
      duration: 8000,
      position: 'center', // `left`, `center` or `right`
      backgroundColor: "linear-gradient(to right, red, orange)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
    
    }).showToast();
    return;
  };

  if(deliveryApartment !== "" && !addressReg.test(deliveryApartment)){
Toastify({
  text: "Error! Delivery apartment can be left blank or must have numbers or charachters only! No symbols allowed.",
  duration: 8000,
  position: 'center', // `left`, `center` or `right`
  backgroundColor: "linear-gradient(to right, red, orange)",
  stopOnFocus: true, // Prevents dismissing of toast on hover

}).showToast();
  }

  if(deliveryCity === "" || !charReg.test(deliveryCity)){
    Toastify({
      text: "Error! Enter Valid City!",
      duration: 8000,
      position: 'center', // `left`, `center` or `right`
      backgroundColor: "linear-gradient(to right, red, orange)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
    
    }).showToast();
  return;
  }
  if(deliveryState === "" || !charReg.test(deliveryState)){
    Toastify({
      text: "Error! Enter Valid State/Region!",
      duration: 8000,
      position: 'center', // `left`, `center` or `right`
      backgroundColor: "linear-gradient(to right, red, orange)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
    
    }).showToast();
    return;
  };


  if(deliveryCountry === 'Select Country' || !charReg.test(deliveryCountry)){
    Toastify({
      text: "Error! Enter Valid Country",
      duration: 8000,
      position: 'center', // `left`, `center` or `right`
      backgroundColor: "linear-gradient(to right, red, orange)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
    
    }).showToast();
return;
  };

  if(deliveryZip === "" || !zipReg.test(deliveryZip)){
    Toastify({
      text: "Error! Enter A Valid Zip Code!",
      duration: 8000,
      position: 'center', // `left`, `center` or `right`
      backgroundColor: "linear-gradient(to right, red, orange)",
      stopOnFocus: true, // Prevents dismissing of toast on hover
    
    }).showToast();
    return;

  };

let customerInfoObj = {
  Email : document.getElementById('delivery-email').value.trim(),
  First : document.getElementById("delivery-first-name").value.trim(),
  Last : document.getElementById('delivery-last-name').value.trim(),
  Phone : document.getElementById('delivery-phone').value.trim(),
  Address : document.getElementById("delivery-address").value.trimEnd(),
  State : document.getElementById('delivery-state-region').value.trimEnd(),
City : document.getElementById("delivery-town").value.trim().trimEnd(),
  Country : document.getElementById("country-form-select-delivery").value,
  Zip : document.getElementById("delivery-zip").value.trim(),
}


  const cart = await fetch(window.location.origin + '/cart'); //get the current cart items from session 
  let currentCart = await cart.json();
  // console.log(currentCart);
  let serverObj = {}; // object that will be sent back to server
  let cartArr = []; // create empty cart object for items
  for(let i = 0; i < currentCart.length; i++){ // add each object to the array with name, quantity and price
    let obj = { name: "Watch", quantity: '1', 
    basePriceMoney: {amount: Number(String(currentCart[i].product.price).concat('00')), //add two zeros behind for squares converstion and them turn it back to number
      currency: 'USD'}
    };
      cartArr.push(obj);
  }
  serverObj.products = cartArr; // add cartArr to products in serverObj
  serverObj.email = userEmail; // add users email to email in serverObj before sending to server for processing
  serverObj.customer = customerInfoObj; // add customer object to object that is being sent to server
  console.log(serverObj)
  // console.log(cartArr);

  // console.log(currentCart);
  let sum = 0;
  const getTotal = () =>{ // get total price of the products from cart
    for(let i = 0; i < currentCart.length; i++){
    sum += Number(currentCart[i].product.price);
    }
    return sum;
  }
//   console.log(getTotal());

const sendCustomerInfo = await fetch(window.location.origin + '/bitcoin-checkout', {
  method: "POST",
  headers:{
    "Content-Type": "application/json"
  },
  body: JSON.stringify(serverObj)
})



try{
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'speed-version': '2022-04-15',
      'content-type': 'application/json',
      authorization: 'Basic c2tfbGl2ZV9sbHE5eWxzZDgzZlc1cU12bGx2b2VsbXF1YmN4dnJDSmxsdm9lbG1xcmNKU3J3Zlc6'
    },
    // metadata: {key_1: 'value_1', key_2: 'value_2'},
    // cashback: {id: 'cb_xxxxxxxxxxxx'},
    body: JSON.stringify({
      currency: 'USD',
      amount: `${getTotal()}`,
      success_message: 'Payment Successful!'
    })
  };
  const bitCoinpay = await fetch('https://api.tryspeed.com/checkout-links', options);
  const payLink = await bitCoinpay.json();
  console.log(payLink);
  location.replace(payLink.url);
}catch(err){

  Toastify({
    text: "An error has occured! Please refresh the page and try again!",
    duration: 8000,
    position: 'center', // `left`, `center` or `right`
    backgroundColor: "linear-gradient(to right, red, orange)",
    stopOnFocus: true, // Prevents dismissing of toast on hover
  
  }).showToast();
  return;

}
 

});
