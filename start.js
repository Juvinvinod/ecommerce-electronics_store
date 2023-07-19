const mongoose = require('mongoose');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
async function main() {
  mongoose.connect(process.env.DATABASE);
}
main().catch((err) => console.log(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`));

// import models
require('./models/User');
require('./models/Category');
require('./models/Product');
require('./models/Address');

// Start our app!
const app = require('./app');

app.set('port', process.env.PORT);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
