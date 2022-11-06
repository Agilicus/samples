const express = require('express'),
    morgan = require('morgan'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    config = require('./DB');

const businessRoute = require('./routes/business.route');
mongoose.Promise = global.Promise;
if (false) {
mongoose.connect(config.DB, { useNewUrlParser: true }).then(
  () => {console.log('Database is connected') },
  err => { console.log('Cannot connect to the database'+ err)}
);
} else {
  var connectWithRetry = function(db) {
    return mongoose.connect(db, { useNewUrlParser: true}).then(
      () => { console.log('Database is connected') },
      err => {
        console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
        setTimeout(connectWithRetry, 5000, db);
      }
    );
  }
  connectWithRetry(config.DB);
}

var version=process.env.version || "1.0"

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname,'../dist/sample-angular-app')));

app.get('/healthz', (req, res) => {
  res.send('OK')
})

app.get('/getversion',function(req,res){
  console.log('Version '+version);
  res.status(200).json({version:version})
});
app.use('/business', businessRoute);

app.use('/',function(req,res){
  res.sendFile(path.join(__dirname,'../dist/sample-angular-app','index.html'))
});
const port = process.env.PORT || 5000;

const server = app.listen(port, function(){
  console.log('Listening on port ' + port);
  console.log('Version '+version);
});
