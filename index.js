//Set up the express module
const express = require('express') 
//body-parser extract the entire body portion of an incoming request stream and exposes it on req.body
const bodyParser = require('body-parser')
//This module stores the session data on the client within a cookie
const cookieSession = require('cookie-session')
const authRouter = require('./routes/admin/auth')
const productRouter = require('./routes/admin/products')
//The app object is instantiated on creation of the Express server. 
const app = express()
/**
 * MiddleWare Function -  are functions that have access to the request object (req), the response object 
 * (res), and the next function in the application’s request-response cycle.
 * To load the middleware function, call app.use(), specifying the middleware function.
 */
//To take a look inside of current working directory and find the public folder and make it available
//to the outside world
app.use(express.static('public'))
/*middleware for parsing bodies from URL and send it to the req.body*/
app.use(bodyParser.urlencoded({extended: true}))
//This keys property is used to encrpty all information that is stored inside the cookie
//to client it will just be random string 
app.use(cookieSession({keys: ['fidshnvfdsg789d']})) //it will do automatically
app.use(authRouter)
app.use(productRouter)
//tell my application to listen for incoming network traffic from the port
app.listen(3000, () => {
    console.log('Listening');
}) 