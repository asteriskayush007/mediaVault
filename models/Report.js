const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    patient:   { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    title:     { type: String, required: true },
    reportType: {
      type: String,
      enum: ['Blood Test','Urine Test','X-Ray','MRI','CT Scan','ECG','Ultrasound','Biopsy','Other'],
      required: true,
    },
    fileUrl:       { type: String, required: true },
    filePublicId:  { type: String },
    fileName:      { type: String },
    labName:       { type: String },
    labRegNumber:  { type: String },
    isLabCertified:{ type: Boolean, default: false },
    testDate:      { type: Date, required: true },
    notes:         { type: String },
    doctorComments: [
      {
        doctorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
        doctorName: String,
        comment:    String,
        addedAt:    { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
