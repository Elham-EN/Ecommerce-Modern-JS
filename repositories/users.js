const fs = require('fs')
const crypto = require('crypto')

class UsersRepositories {
    constructor(filename) { //cannot have asynchronous code inside the constructor
        if (!filename) {
            throw new Error('Creating a repository requires a filename')
        }
        this.filename = filename
        //check if the file exist in the current directory (hard drive)
        try {
            fs.accessSync(this.filename) //if does not exist it will throw error
        } catch (error) {
            //it will create a file for us - second argument is where you provide data
            fs.writeFileSync(this.filename, '[]')
        }
    }

    //get a list of all users
    async getAll() {
        //Open the file called this.filename as promise and read file contents and return list of users
        return JSON.parse(await fs.promises.readFile(this.filename, {encoding: 'utf8'}))
    }

    //creates a user with given attributes
    async create(attrs) { //attrs is an object
        attrs['id'] = this.randomId() //add property to the object
        /*{email: 'alskd@gmail.com, password: 'abcs'} Add it into big array of users and then write that
           update to our users.json file*/
           const records = await this.getAll() //return existing list of users
           records.push(attrs) //add the new user object
           await this.writeAll(records)
    }

    //Write all users to users.json file
    async writeAll(records) {
        //write the updated 'records' array back to this.filename - second args is data to store inside file
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2)) //convert to JSON string
    }

    //Generates a random id & return id
    randomId() {
        return crypto.randomBytes(4).toString('hex')
    }

    //Find the user with the given id
    async getOne(id) {
        const records = await this.getAll()
        return records.find(record => record.id === id)
    }

    async delete(id) {
        const records = await this.getAll()
        //return true if the id is not equal the record.id
        const filteredRecords = records.filter(record => record.id != id)
        await this.writeAll(filteredRecords) //save it back to json file
    }

    //Updates the user with the given id using the given attributes
    async update(id, attrs) {
        const records = await this.getAll() //list of user records [array] in users.json
        const record = records.find(record => record.id === id)
        if (!record) {
            throw new Error(`Record with ${id} not found`)
        }
        Object.assign(record, attrs) //update the property
        await this.writeAll(records) //save it back to json file 
    }
    
    //Find one user with the given filters
    async getOneBy(filters) {
        const records = await this.getAll() //collection of user record
        for (let record of records) { //outer for loop (array)
            let found = true
            for (let key in filters) { //inner for loop (objects)| e.g key = password
                if (record[key] !== filters[key]) { //if {email: "liam@gmail.com"} != {email: "liam@gmail.com"}
                    found = false
                }
            } //end of inner loop
            if (found ) {
                return record //all the keys & values in the filter object is same as the record
            }
        }//end of outer loop
    }
}
const test = async () => {
    const repo = new UsersRepositories('users.json') //Access users repository
    const user = await repo.getOneBy({email: "liam@gmail.com", password: 'mypasswodrd'})
    console.log(user);
}

test()
