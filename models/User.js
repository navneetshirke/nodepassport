const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true},
  password:    { type: String, required: true},
  date:        { type: Date,   default: Date.now },
  facebook_id: { type: String },
  google_id: { type: String }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
