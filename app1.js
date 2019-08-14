const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const mongo = require('mongodb')

//this line connects the images to the HTML
app.use(express.static(path.join(__dirname, 'public')));

//need this line to read any forms
app.use(express.urlencoded())

//connecting to the database
const MongoClient = mongo.MongoClient
var url = 'mongodb://localhost:27017/'

//this is the main page when you go to localhost:3000
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','DogCostumes.html'));
})

//this post is the main driver of the app and saves all likes into a database
app.post('/', (req,res)=>{
    console.log('button was pushed')
    mongo.connect(url, function(err, db){
        console.log(err)
        var mydb = db.db("Concerts")
        var c1 = req.body.C1;
        var c2 = req.body.C2;
        var c3 = req.body.C3;
        var c4 = req.body.C4;
        mydb.collection('Users').updateone(person,function(err, result){
            console.log('Item inserted')
            db.close();
        });
    })

})


//This is a login page
app.get('/login', (req, res)=>{
     res.render('login.ejs')
})

app.get('/register', (req, res)=>{
     res.render('register.ejs')
})

//register form post
app.post('/register',  (req, res)=>{
    var person = {
        user: req.body.email,
        pw: req.body.password,
        name: req.body.name,
        C1: null,
        C2: null,
        C3: null,
        C4: null
    }
    mongo.connect(url, function(err, db){
        console.log(err)
        var mydb = db.db("Concerts")
        mydb.collection('Users').insertOne(person,function(err, result){
            //mydb.collection('User').
            console.log('Item inserted')
            db.close();
        });
    })
    res.redirect('/login')//after the page finishes go to the login page
})


//404 error page
app.get('/*',(req,res)=>{
    res.status(404).json("STOP IT!!  This message brought to you by the good people at Error 404");
})

//listen on specific port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))