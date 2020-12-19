const express = require('express')
const cartsRepo = require('../repositories/carts')
const productRepo = require('../repositories/products')
const cartShowTemplate = require('../views/carts/show')
const router = express.Router()

//Receive a POST request to add an item to a cart
router.post('/cart/products', async (req, res) => {
    //Figure out the cart
    let cart
    if (!req.session.cartId) { //Check whether user has a cart on the cartId property 
        //We dont have a cart, we need to create one, and store the cart id on the
        //req.session.cartId property
        cart = await cartsRepo.create({ items: [] })
        req.session.cartId = cart.id
    } else { 
        //We have a cart, lets get it from the repository
        cart = await cartsRepo.getOne(req.session.cartId)
    }
    //Either increment quantity for existing product or add new product to items array
    const existingItem = cart.items.find((item) => item.productId === req.body.productId)
    if (existingItem) {
        //Increment quantity and save cart
        existingItem.quantity++
    } else {
        //add new product id to items array
        cart.items.push({ productId: req.body.productId, quantity: 1 })
    }
    await cartsRepo.update(cart.id, { items: cart.items })
    res.redirect('/cart')
})

//Receive a GET request to show all items in cart
router.get('/cart', async (req, res) => {
    if (!req.session.cartId) { //if this user does not have cart id
        return res.redirect('/')
    }
    const cart = await cartsRepo.getOne(req.session.cartId)
    for (let item of cart.items) { //item === { id: a35ggfg4, quantity: 3 }
        const product = await productRepo.getOne(item.productId)
        item.product = product
    }
    res.send(cartShowTemplate({ items: cart.items }))
})

//Receive a POST request to delete an item from a cart
router.post('/cart/products/delete', async (req, res) => {
    //console.log(req.body.itemId);
    const { itemId } = req.body
    //cartId belong to the specific user
    const cart  = await cartsRepo.getOne(req.session.cartId)
    const items = cart.items.filter(item => item.productId !== itemId)
    await cartsRepo.update(req.session.cartId, { items: items })
    res.redirect('/cart')
})

module.exports = router