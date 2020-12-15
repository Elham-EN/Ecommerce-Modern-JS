const express = require('express')
//middleware for handling multipart/form-data, which is primarily used for uploading files.
const multer = require('multer')
const { handleErrors } = require('./middlewares')
const productRepo = require('../../repositories/products')
const productNewTemplate = require('../../views/admin/products/new')
const productsIndexTemplate = require('../../views/admin/products/index')
const { requireTitle, requirePrice} = require('./validators')
const router = express.Router()
//which tells Multer where to upload the files.The files will be kept in memory 
const upload = multer({ storage: multer.memoryStorage() }) 

router.get('/admin/products', async (req, res) => {
    const products = await productRepo.getAll() //get all products from products.json file
    res.send(productsIndexTemplate({ products }))
})

//GET is just going to retrieve the form
router.get('/admin/products/new', (req, res) => {
    res.send(productNewTemplate({}))
})

//POST is going to be the user trying to submit infomration in the form
router.post('/admin/products/new',upload.single('image') ,[requireTitle, requirePrice],
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

module.exports = router