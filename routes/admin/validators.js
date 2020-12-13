const { check } = require('express-validator')
const userRepo = require('../../repositories/users')

module.exports = {
    requireEmail: check('email') // string of field names to validate against
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must be vaild email')
        /*Custom validators may return Promises to indicate an async validation (which will be 
          awaited upon), or throw any value/reject a promise to use a custom error messag*/
        .custom(async (email) => { //Custom validator
            const existingUser = await userRepo.getOneBy({email: email})
            if (existingUser) { //check if it contain that email already in users.json file
                throw new Error('Email in use')
            }
        }),

    requirePassword: check('password')
        .trim()
        .isLength({ min: 4, max: 10 })
        .withMessage('Must between 4 & 20 chars'),

    requirePasswordConfirmation: check('passwordConfirmation')
        .trim()
        .isLength({ min: 4, max: 10 })
        .withMessage('Must between 4 & 20 chars')
        .custom( (passwordConfirmation, { req }) => {
            if (passwordConfirmation !== req.body.password) {
                throw new Error('Password must match')
            } else { //if password is valid then return true
                //expects an explicit Boolean flag for every synchronous validation
                return true
            }
        }),

    requireEmailExist: check('email')
        .trim()
        .normalizeEmail()
        .isEmail().withMessage('Must provide a vaild email')
        .custom(async (email) => {
            const user = await userRepo.getOneBy({ email: email })
            if (!user) {
                throw new Error('Email not found')
            }
        }),

    requireValidPasswordForUser: check('password')
        .trim()
        .custom(async (password, { req }) => {
            const user = await userRepo.getOneBy({ email: req.body.email })
            if (!user) {
                throw new Error('Invalid password')
            }
            const validPassword = await userRepo.comparePasswords(user.password, password)
            if (!validPassword) {
                throw new Error('Invalid password')
            }
        })
}