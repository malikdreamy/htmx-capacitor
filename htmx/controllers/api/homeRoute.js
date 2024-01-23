const router = require('express').Router();
const Product = require('../../models/product-model');


router.get('/', async(req,res)=>{
try {
    console.log(req.headers['user-agent'])
const products = await Product.find({});

res.render('homepage-not-logged-in.ejs', {products: products});
    
} catch (error) {
    console.log(error);
}
})          


router.get('/message', async(req , res)=>{
    try {
        console.log('message');
        res.render('./components/message.ejs', {message: "hi"})

    } catch (error) {
        console.log(error)
    }
})


router.get('/login', async(req, res)=>{
    try {

res.render('login.ejs');
        
} catch (error) {
 console.log(error)
}
})


router.post('/login', async(req,res)=>{
    try {
console.log('hi')
        const password = req.body.password;
        const email = req.body.email;
        if(!password || !email){
                    return;
        }
res.render('homepage.ejs');
        
    } catch (error) {
        console.log(error)
        
    }
})




module.exports = router;