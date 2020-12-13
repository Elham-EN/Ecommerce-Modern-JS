module.exports = {
    getError(errors, propName) {
        //errors.mapped() will give back an object & [propName] going to look at the sub object. 
        //errors.mapped() === { email: {value: test@email.com, msg: 'email in use', ...}, password: {...}, ... }
        try {
            //Gets all validation errors contained in this result object.
            //Returns: an object where the keys are the field names, and the values are the validation errors
            return errors.mapped()[propName].msg
        } catch (err) {
            return ''
        }
    }
}