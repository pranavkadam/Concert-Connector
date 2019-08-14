import express from 'express';
import path from 'path';
import cookeParser from 'cookie-parser';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import expressValidator from 'express-validator';
import flash from 'connect-flash';
import session from 'express-session';
import passport from 'passport';
const LocalStrategy = require('passport-local').Strategy;
import mongoose from 'mongoose';
import index from './routes/index';
import users from './routes/users';
import { comparePassword, getUserByEmail, getUserById } from './models/User';

mongoose.Promise = global.Promise;
var URL = 'mongodb://pdkadam:root@ordersdb-shard-00-00-jvcv5.mongodb.net:27017,ordersdb-shard-00-01-jvcv5.mongodb.net:27017,ordersdb-shard-00-02-jvcv5.mongodb.net:27017/Users?ssl=true&replicaSet=OrdersDb-shard-0&authSource=admin&retryWrites=true'

mongoose.connect(URL, {
	useMongoClient: true
});
mongoose.model('Transactions', {
    seller_id: String,
    buyer_id: String,
    transaction_id: String,
});
export const connection = mongoose.connection;

const app = express();
const PORT = 7000;

app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookeParser());

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback : true
},
	function(req, email, password, done) {
		getUserByEmail(email, function(err, user) {
			if (err) { return done(err); }
	  		if (!user) {
				return done(null, false, req.flash('error_message', 'No email is found'));
	  		}
	  		comparePassword(password, user.password, function(err, isMatch) {
				if (err) { return done(err); }
				if(isMatch){
		  				return done(null, user, req.flash('success_message', 'You have successfully logged in'));
				}
				else{
		  				return done(null, false, req.flash('error_message', 'Incorrect Password'));
				}
	 		});
		});
  	}
));

passport.serializeUser(function(user, done) {
  	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  	getUserById(id, function(err, user) {
		done(err, user);
  	});
});

app.use(expressValidator());

app.use(flash());

app.use(function(req, res, next){
	res.locals.success_message = req.flash('success_message');
	res.locals.error_message = req.flash('error_message');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
  	next();
});

app.use('/', index);
app.use('/users', users);

app.listen(PORT, function(){
	console.log('Server is running on',PORT);
});
