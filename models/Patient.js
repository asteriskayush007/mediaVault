const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      default: () => 'MV-' + uuidv4().slice(0, 8).toUpperCase(),
    },
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone:    { type: String },
    dob:      { type: Date },
    gender:   { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
    address:  { type: String },
    emergencyContact: { type: String },
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  },
  { timestamps: true }
);

patientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

patientSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);
