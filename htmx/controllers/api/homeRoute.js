const router = require('express').Router();


router.get('/', async(req,res)=>{
try {
    console.log('hi');

    res.render('index.ejs')
    
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

router.post('/post', async(req,res)=>{
    try {

        console.log(req.body)
        res.send(req.body.some_input_name);
        
    } catch (error) {
        console.log(error)
        
    }
})




module.exports = router;