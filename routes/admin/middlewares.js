const { validationResult } = require('express-validator')

module.exports = {
    handleErrors(templateFunc, dataCallback) { //second argument is optional 
        return async (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                let data = {}
                if (dataCallback) { //if it exist and passed in and then...
                    //call the second argument of productsEditTemplate in products.js  
                    data = await dataCallback(req) //store product object
                }
                /*data variable is an object with key & value & merge it in with existing object 
                by using the spread operator. Now templateFunc will have access to the product */
                return res.send(templateFunc({ errors: errors, ...data }))
            }
            next() //call the next middleware or invoke my actual route handler
        }
    },
    
    requireAuth(req, res, next) {
        if (!req.session.userId) { //if user is not signed in
            return res.redirect('/signin')
        }
        next()
    }
}