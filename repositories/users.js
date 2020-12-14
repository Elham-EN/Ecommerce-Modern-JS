const fs = require('fs')
const crypto = require('crypto')
const util = require('util')
const Repository = require('./repository')
const scrypt = util.promisify(crypto.scrypt)

class UsersRepositories extends Repository {
     //creates a user with given attributes -- Override exisitg create() method
     async create(attrs) { //attrs is an object
        attrs['id'] = this.randomId() //add property to the object
        const salt = crypto.randomBytes(8).toString('hex')
        /*scrypt password-base key function is an algorithm designed to converts human readable passwords 
        into fixed length arrays of bytes, which can then be used as a key for private keys, et cetera.*/ 
        const buf = await scrypt(attrs.password, salt, 64)
        /*{email: 'alskd@gmail.com, password: 'abcs'} Add it into big array of users and then write that
        update to our users.json file*/
        const records = await this.getAll() //return existing list of users
        //Take out all the properties out of attrs object & then override those exisitng properties 
        //with this new password. meaning replace default or plaintext password provided inside 
        //parameter attrs
        const record = {...attrs, password: `${buf.toString('hex')}.${salt}`}
        records.push(record) //add the new user object
        await this.writeAll(records)
        return record //contain id of user we just made
    }

    async comparePasswords(saved, supplied) {
        //saved -> password saved in the json file. 'hashed.salt'
        //Supplied -> password given to us by user trying to sign in
        const [hashed, salt] = saved.split('.')
        //console.log(hashed);
        //console.log(salt);
        const hashedSuppliedBuff = await scrypt(supplied, salt, 64)
        //console.log(hashedSuppliedBuff.toString('hex'));
        return hashed === hashedSuppliedBuff.toString('hex')
    }
}

module.exports = new UsersRepositories('users.json')
