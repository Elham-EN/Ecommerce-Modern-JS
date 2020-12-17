const express = require('express')
//middleware for handling multipart/form-data, which is primarily used for uploading files.
const multer = require('multer')
const { handleErrors, requireAuth } = require('./middlewares')
const productRepo = require('../../repositories/products')
const productNewTemplate = require('../../views/admin/products/new')
const productsIndexTemplate = require('../../views/admin/products/index')
const productsEditTemplate = require('../../views/admin/products/edit')
const { requireTitle, requirePrice} = require('./validators')
const router = express.Router()
//which tells Multer where to upload the files.The files will be kept in memory 
const upload = multer({ storage: multer.memoryStorage() }) 

//Not invoking requireAuth func right here, so the route handler can call that function at
//some point in the fututre with the request, response and next() function.
router.get('/admin/products', requireAuth, async (req, res) => {
    const products = await productRepo.getAll() //get all products from products.json file
    res.send(productsIndexTemplate({ products }))
})

//GET is just going to retrieve the form
router.get('/admin/products/new', requireAuth, (req, res) => {
    res.send(productNewTemplate({}))
})

//POST is going to be the user trying to submit infomration in the form
//requireAuth make sure user is signed in before user can start upload the image
router.post('/admin/products/new', requireAuth, upload.single('image'), [requireTitle, requirePrice],
    //no parentheses because we are passing reference to that function. So that it can be called
    //at some point time in the future repeatedly everytime that request comes in 
    handleErrors(productNewTemplate), 
    async (req, res) => {
        /*req.file object has all different properties about the file that was uploaded. Raw image data is
        stored inside of the buffer property and convert it to string */
        const image = req.file.buffer.toString('base64') //base64 represent an image in a string format
        const { title, price } = req.body
        await productRepo.create({ title: title, price: price, image: image })
        res.redirect('/admin/products')
    }
)

//Receive whatever string of chars are right here in :id as a variable in the req object
router.get('/admin/products/:id/edit', requireAuth, async (req, res) => {
    //getOne return the product that match id from the URL
    const product = await  productRepo.getOne(req.params.id) 
    if (!product) {
        return res.send('Product not found')
    }
    res.send(productsEditTemplate({ product }))
}) 

//Upate the product when edited 
router.post('/admin/products/:id/edit', requireAuth, upload.single('image'),
    [requireTitle, requirePrice],
    //If something goes wrong with the validation then invoking the callback function 
    handleErrors(productsEditTemplate, 
        async (req) => { //second argument is optional and it is a callback function 
            const product  = await productRepo.getOne(req.params.id)
            return { product } //return this object inside the template 
        }
    ),//end of handleErrors(para)
    async (req, res) => {
        const changes = req.body /*req body object contain the updated title & price*/ 
        if (req.file) { //if file was provided in this request then ...
            //req.file is the file that was uploaded, buffer is kind of array with all raw data
            changes.image = req.file.buffer.toString('base64') //encode as base 64 string
        }
        try {
            //Applay this update to the products repository
            await productRepo.update(req.params.id, changes)
        } catch (error) {
            return res.send('Could not find item')
        }
        res.redirect('/admin/products')
    }
)

router.post('/admin/products/:id/delete', requireAuth, async (req, res) => {
    await productRepo.delete(req.params.id)
    res.redirect('/admin/products')
})


module.exports = router