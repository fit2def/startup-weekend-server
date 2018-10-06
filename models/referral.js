const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const referralSchema = new Schema({
    referrerPhone: String, 
    referreePhone: String,
    used: Boolean
}); 

module.exports = mongoose.model('Referral', referralSchema);