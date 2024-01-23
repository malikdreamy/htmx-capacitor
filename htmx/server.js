const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Closet-Catch';
const app = express();
const routes = require('./controllers/index');




app.use(express.urlencoded({extended:true}));
app.use(express.json({ limit: '10mb' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(routes);

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(MONGODB_URI)
.then(()=>{
    console.log("Connected To MongoDB");

    app.listen(3000, ()=>{
        console.log('server listening on port 3000')
    })
}).catch((error)=>{
    console.log(`Error ${error}`)
})

