const express = require('express')
const { check } = require('express-validator')
const userRepo = require('../../repositories/users')
const signupTemplate = require('../../views/admin/auth/signup')
const signTemplate = require('../../views/admin/auth/signin')
/*We can just think of like an app object. Going to keep track of all the different route handlers that we
set up. The router object can link it up back up to our app inside the index.js*/ 
const router = express.Router()

//Routing refers to determining how an application responds to a client request to a particular endpoint
router.get('/signup', (req, res) => { //when user goes to localhost:3000 which send a request to the application
    //The application respond with sending a html form to the client
    res.send(signupTemplate({ req: req }))
})

//Getting post request from user form signup and Respond to POST request on the root route (/) homepage*/
router.post('/signup',[
        check('email').trim().normalizeEmail().isEmail(),
        check('password'),
        check('passwordConfirmation')
    ] , async (req, res) => {
    const  {email, password, passwordConfirmation} = req.body //destructing 
    const existingUser = await userRepo.getOneBy({email: email})
    if (existingUser) { //check if it contain that email already in users.json file
        return res.send('Email in use')
    }
    if (password != passwordConfirmation) {
        return res.send('Password must match')
    }
    //Create a user in our user repo to represent this person 
    const user = await userRepo.create({email: email, password: password})
    //Store the id of that user inside the users cookie. userId is property of session object & store id
    req.session.userId = user.id
    res.send('Account created!!!')
})

//when client make a request to /signout and the application will sign out the user
router.get('/signout', (req, res) => {
    //tell the client/browser to clear out all the infromation stored inside the their cookie
    req.session = null
    res.send('You are logged out')
})

//First need to send a form to the client that they can enter thier login information and
//when user submit a form, then need to creare a post request handler to handle that form submission
router.get('/signin', (req, res) => {
    res.send(signTemplate())
})

router.post('/signin', async (req, res) => {   
    const {email, password} = req.body
    const user = await userRepo.getOneBy({ email: email })
    if (!user) {
        return res.send('Email not found')
    }
    const validPassword = await userRepo.comparePasswords(user.password, password)
    if (!validPassword) {
        return res.send('Invaild password')
    }
    req.session.userId = user.id //allow user to be authenticated with the application

    res.send('You are signed In')
})

module.exports = router //available to other files in the project