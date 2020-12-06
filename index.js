//Set up the express module
const express = require('express') 

//body-parser extract the entire body portion of an incoming request stream 
//and exposes it on req.body
const bodyParser = require('body-parser')

//it is an object that describes all the different things the web server can do
const app = express()

/*The app object is instantiated on creation of the Express server. To setup your middleware, 
you can invoke app.use(<specific_middleware_layer_here>) for every middleware layer that you 
want to add (it can be generic to all paths, or triggered only on specific path(s) your server 
handles), and it will add onto your Express middleware stack.*/
app.use(bodyParser.urlencoded({extended: true}))

//Route handler
app.get('/', (req, res) => {
    res.send(`
        <div>
            <form method="POST">
                <input name="email" placeholder="email" />
                <input name="password" placeholder="password" />
                <input name="passwordConfirmation" placeholder="password confirmation" />
                <button>Sign Up</button>
            </form>
        </div>
    `)
})

//my own MiddleWare Function
const myOwnBodyParser = (req, res, next) => {
    if (req.method === 'POST') { //if we are dealing with post request
         //Once node completes reading request data. an event called ‘data’ on incoming http request. 
         //We first get the data by listening to the stream data event
         req.on('data', (data) => { 
            const parsed = data.toString('utf8').split('&') //become an array of string
            const formData = {} // empty object
            for (let pair of parsed) { //loops through the values of each element
                // split() --> 'key: email vlaue: 101571578@gmail.com', & Destructuring 
                const [key, value] = pair.split('=')
                formData[key] = value //add new properties to an object: Using square bracket notation:
            }//end of loop
            req.body = formData
            next() //end the request-response cycle,
        })
    } else {
        next() //callback function - a sign that we are done with the processing 
    }
}

/*Whenever we get a post request to forward slash - run this function (bodyParser). and then once
that function calls its next() callback, take req & res objects and pass them through the next 
fucntion in third argument of post() function */
app.post('/', (req, res) => {
    console.log(req.body); 
    res.send('Account created!!!')
})

//tell my application to listen for incoming network traffic from the port
app.listen(3000, () => {
    console.log('Listening');
})