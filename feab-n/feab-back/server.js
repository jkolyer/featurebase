let express = require('express');
let app = express();
let mongoose = require('mongoose');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let path = require('path');
let createError = require('http-errors');

// let port = 8080;

/*
let book = require('./app/routes/book');
app.get("/", (req, res) => res.json({message: "Welcome to FeatureBase!"}));
app.route("/book")
    .get(book.getBooks)
    .post(book.postBook);
app.route("/book/:id")
    .get(book.getBook)
    .delete(book.deleteBook)
    .put(book.updateBook);
*/


let config = require('config'); //we load the db location from the JSON files
//db options
let options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};

//db connection
mongoose.connect(config.DBHost, options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//don't show the log when it is test
if(config.util.getEnv('NODE_ENV') !== 'test') {
    //use morgan to log at command line
    app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

//parse application/json and look for raw text

/*
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));
*/

app.use(express.json());
app.use(express.json({ type: 'application/json'}));
app.use(express.urlencoded({ extended: true }));


let indexRouter = require('./app/controllers/routes/index');
let usersRouter = require('./app/controllers/routes/users');
let rolesRouter = require('./app/controllers/routes/roles');
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.route("/roles")
    .get(rolesRouter.getRoles)
    .post((req, res) => {
	debugger
	rolesRouter.postRole(req, res);
    });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



let port = config.PORT_BACK 
app.listen(port);
console.log("Listening on port " + port);


module.exports = app; // for testing

/*
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./app/controllers/routes/index');
let usersRouter = require('./app/controllers/routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

pmodule.exports = app;
*/
