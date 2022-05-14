//MONGODB DATABASE SETUP
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://ansh1515:ansh2783@cluster0.j8btg.mongodb.net/authSystem?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser : true,
    useUnifiedTopology: true
}).then(() => console.log(`<<MONGODB CONNECTED>>`))
.catch(err => console.log(err));
