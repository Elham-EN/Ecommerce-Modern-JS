const express = require("express");
const { handleErrors, requireAuth } = require("./middlewares");
const userRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExist,
  requireValidPasswordForUser,
} = require("./validators");
/*We can just think of like an app object. Going to keep track of all the different route handlers that we
set up. The router object can link it up back up to our app inside the index.js*/
const router = express.Router();

//Routing refers to determining how an application responds to a client request to a particular endpoint
router.get("/signup", (req, res) => {
  //when user goes to localhost:3000 which send a request to the application
  //The application respond with sending a html form to the client
  res.send(signupTemplate({ req: req }));
});

//Getting post request from user form signup and Respond to POST request on the root route (/) homepage*/
router.post(
  "/signup",
  [requireEmail, requirePassword, requirePasswordConfirmation], //end of second argument
  handleErrors(signupTemplate),
  async (req, res) => {
    const { email, password } = req.body; //destructing
    //Create a user in our user repo to represent this person
    const user = await userRepo.create({ email: email, password: password });
    //Store the id of that user inside the users cookie. userId is property of session object & store id
    req.session.userId = user.id;
    res.redirect("/admin/products");
  } //end of third argument
); //end of post method

//when client make a request to /signout and the application will sign out the user
router.get("/signout", (req, res) => {
  //tell the client/browser to clear out all the infromation stored inside the their cookie
  req.session = null;
  res.send("You are logged out");
});

//First need to send a form to the client that they can enter thier login information and
//when user submit a form, then need to create a post request handler to handle that form submission
router.get("/signin", (req, res) => {
  res.send(signinTemplate({}));
});

//Array of check() function - second argument of post() function
router.post(
  "/signin",
  [requireEmailExist, requireValidPasswordForUser],
  handleErrors(signinTemplate),
  //Async arrow function - third argument of post() function
  async (req, res) => {
    //Extracts the validation errors from a request and makes them available
    const { email } = req.body;
    const user = await userRepo.getOneBy({ email: email }); //user with that given email exist
    req.session.userId = user.id; //allow user to be authenticated with the application

    res.redirect("/admin/products");
  }
);

module.exports = router; //available to other files in the project
