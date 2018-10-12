const express = require('express');

const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const createError = require('http-errors');

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


const config = require('config');
// db options
const options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
};

// db connection
mongoose.connect(config.DBHost, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// don't show the log when it is test
if (config.util.getEnv('NODE_ENV') !== 'test') {
    // use morgan to log at command line
    // 'combined' outputs the Apache style LOGs
    app.use(morgan('combined'));
}


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

// parse application/json and look for raw text

app.use(express.json());
app.use(express.json({ type: 'application/json' }));
app.use(express.urlencoded({ extended: true }));


const indexRouter = require('./app/controllers/routes/index');
const usersRouter = require('./app/controllers/routes/users');
const rolesRouter = require('./app/controllers/routes/roles');

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.route('/role')
    .get(rolesRouter.getRoles)
    .post((req, res) => {
        rolesRouter.postRole(req, res);
    });

app.route('/role/:id')
    .get(rolesRouter.getRole)
    .delete(rolesRouter.deleteRole)
    .put(rolesRouter.updateRole);


// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const port = config.PORT_BACK;
app.listen(port);
console.log(`Listening on port ${port}`);

module.exports = app;
