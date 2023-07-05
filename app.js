const express = require("express");
const app = express();
const log = require("lambda-log");
const cors = require("cors");
const bodyParser = require("body-parser");
log.options.debug = process.env.EnableLogs === "true" ? true : false;
// require("./services/db");

app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const routes = require("./routes/index");

app.use("/api", routes);

app.use(function (err, req, res, next) {

  log.error(err); // Log error message in our server's console
  if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
  res.status(err.statusCode).send({
    message: err.message
  }); // All HTTP requests must have a response, so let's send back an error with its status code and message
});

// app.listen(3100, () => {
//   console.log('Server is runnning');      // for local purpose only
// })


module.exports = app;
