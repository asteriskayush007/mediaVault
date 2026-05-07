const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const doctorSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    email:          { type: String, required: true, unique: true, lowercase: true },
    password:       { type: String, required: true, minlength: 6 },
    phone:          { type: String },
    specialization: { type: String, required: true },
    licenseNumber:  { type: String, required: true, unique: true },
    experience:     { type: Number },
    hospital:       { type: String },
    bio:            { type: String },
    degreeFile:     { type: String },   // Cloudinary URL
    licenseFile:    { type: String },   // Cloudinary URL
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    accessLog: [
      {
        patientId:  String,
        accessedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

doctorSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);
