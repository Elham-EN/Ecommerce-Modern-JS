const { validationResult } = require('express-validator')

module.exports = {
    handleErrors(templateFunc) {
        return (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.send(templateFunc({ errors: errors }))
            }
            next() //call the next middleware or invoke my actual route handler
        }
    } 
}