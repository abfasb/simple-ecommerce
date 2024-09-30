const express = require('express');
const bodyParser = require('body-parser');
const ECommerceRoutes = require('../routes/ECommerceRoutes');
const path = require('path');
const session = require('express-session');
const PORT = 5000;

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', 'views'))
app.use(bodyParser.urlencoded({ extended: true }));


require('dotenv').config();


app.use(session({
    secret: process.env.API_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));


app.use('/', ECommerceRoutes);

app.listen((PORT),() => {
    console.log('Server is running at port: ' + PORT);

})




