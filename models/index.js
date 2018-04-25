const mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://dbuser:dbuser@ds125588.mlab.com:25588/warbler', {
  keepAlive: true
  //useMongoClient: true
});
mongoose.connection.on('error',
                        console.error.bind(console, 'connection error:')
                      );  //ON CONNECTION ERROR
mongoose.connection.once('open', () => {
  console.log('MongoDB -> \'warbler\' database connected!');
});

module.exports.User = require('./user');
module.exports.Message = require('./message');
