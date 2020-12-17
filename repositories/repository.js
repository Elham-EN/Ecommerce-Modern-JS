const fs = require('fs')
const crypto = require('crypto')

module.exports = class Repository {
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
    
    //Create a product with a given attibutes
    async create(attrs) {
        attrs.id = this.randomId()
        const records = await this.getAll()
        records.push(attrs)
        await this.writeAll(records)
        return attrs //attrs object has been updated with id
    }

    //get a list of all users
    async getAll() {
        //Open the file called this.filename as promise and read file contents and return list of users
        return JSON.parse(await fs.promises.readFile(this.filename, {encoding: 'utf8'}))
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

    //Find the user/product with the given id
    async getOne(id) {
        const records = await this.getAll()
        return records.find(record => record.id === id)
    }

    async delete(id) {
        const records = await this.getAll()
        //return true if the id is not equal the record.id
        const filteredRecords = records.filter(record => record.id != id)
        console.log(filteredRecords);
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
    async getOneBy(filters) { //parameter - object: { email: soran@email.com }
        const records = await this.getAll() //collection of user record in json file
        for (let record of records) { //outer for loop (array)
            let found = true
            for (let key in filters) { //inner for loop (objects)| e.g key = password
                console.log('record[key]: ', record[key], '    filters[key]: ', filters[key]);
                if (record[key] !== filters[key]) { //if {email: "liam@gmail.com"} != {email: "liam@gmail.com"}
                    found = false //if not same then return false
                }
            } //end of inner loop
            if (found ) {
                /**Record return specific define user record based on the filters parameter
                 *  {
                        email: 'soran@email.com',
                        password: 'eb3adec8d7d618bea5efa6b467bcda45b4670e95d3c0c01d87b4.7c795...',
                        id: '37de1e4c'
                    }
                 */
                return record //all the keys & values in the filter object is same as the record
            }
        }//end of outer loop
    }
}