const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const referrerSchema = new Schema({
    phone: String,
    password: String
});

module.exports = mongoose.model('Referrer', referrerSchema);
