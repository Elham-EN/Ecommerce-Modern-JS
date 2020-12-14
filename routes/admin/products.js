const express = require('express')
const productRepo = require('../../repositories/products')
const productNewTemplate = require('../../views/admin/products/new')
const router = express.Router()

router.get('/admin/products', (req, res) => {

})

router.get('/admin/products/new', (req, res) => {
    res.send(productNewTemplate({}))
})

module.exports = router