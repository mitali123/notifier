var createError = require('http-errors');
var express = require('express');
var path = require('path');
const noCache = require('nocache');
var session = require('express-session');
var consumer = require('./consumer');
var models = require('./models');
const promClient = require('prom-client');

var indexRouter = require('./routes/index');
var app = express();


const message_counter = new promClient.Counter({
  name: 'notifier_kafka_message_counter',
  help: 'Notifier: keep count of messages consumed on kafka',
  labelNames: ['topic','type']
});

const db_oper = new promClient.Summary({
  name: 'notifier_request_timed_calls',
  help: 'Notifer: Time taken by external services to respond',
  labelNames: ['service']
});


//consumer.consumeMessage();
app.get('/helloworld', (req, res) => {
  res.send("Hello");
})

app.get('/metrics', function (req, res) {
  res.send(
    require('prom-client').register.metrics()
  )
})

app.get('/health', (request, response) => {
  var offset = consumer.getKafkaClient();
  const end = db_oper.startTimer({service: 'kafka'});
  offset.on('ready', function() {
      end();
       console.log("Kafka Consumer is connected and ready.");
       models.sequelize.authenticate().then(() => {
         console.log('Connection has been established successfully.');
         response.status(200).send('Connection to Kafka and DB successful');
       })
       .catch(err => {
         console.error('Unable to connect to the database:', err);
         response.status(500).send('Error connecting to DB');
       });
       
   });

   kafkaClient.on("error", function(error) {
       console.error('Unable to connect to Kafka:', error);
       response.status(500).send('Error connecting to Kafka');
   });     
})


app.get('/ready', (request, response) => {
  var offset = consumer.getKafkaClient();
  const end = db_oper.startTimer({service: 'kafka'});
  offset.on('ready', function() {
       end();
       console.log("Kafka Consumer is connected and ready.");
       models.sequelize.authenticate().then(() => {
         console.log('Connection has been established successfully.');
         response.status(200).send('Connection to Kafka and DB successful');
       })
       .catch(err => {
         console.error('Unable to connect to the database:', err);
         response.status(500).send('Error connecting to DB');
       });
       
   });

   kafkaClient.on("error", function(error) {
       console.error('Unable to connect to Kafka:', error);
       response.status(500).send('Error connecting to Kafka');
   });     
})
// no caching
app.use(noCache());

app.use(function(req, res, next) {
    if(!req.session.email) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');   
    }
    next();
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
  res.status(err.status);
});



module.exports = app;
exports.message_counter = message_counter;
exports.db_oper = db_oper;
