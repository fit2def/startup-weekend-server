const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const referrerSchema = new Schema({
    password: String, 
    phone: String
});

module.exports = mongoose.model('Referrer', referrerSchema);
