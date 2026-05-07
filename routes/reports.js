const express = require('express');
const router  = express.Router();
const Report  = require('../models/Report');
const Patient = require('../models/Patient');
const Doctor  = require('../models/Doctor');
const { protect, patientOnly, doctorOnly } = require('../middleware/auth');
const { uploadReport } = require('../config/cloudinary');

/* ── Upload a report (Patient) ───────────────────────────────── */
router.post('/upload', protect, patientOnly,
  uploadReport.single('reportFile'),
  async (req, res) => {
    try {
      const { title, reportType, labName, labRegNumber, isLabCertified, testDate, notes } = req.body;
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

      const report = await Report.create({
        patient: req.user._id,
        title, reportType, labName, labRegNumber,
        isLabCertified: isLabCertified === 'true',
        testDate, notes,
        fileUrl:      req.file.path,
        filePublicId: req.file.filename,
        fileName:     req.file.originalname,
      });

      await Patient.findByIdAndUpdate(req.user._id, { $push: { reports: report._id } });
      res.status(201).json({ success: true, report });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* ── My reports (Patient) ────────────────────────────────────── */
router.get('/mine', protect, patientOnly, async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user._id }).sort({ testDate: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── Delete report (Patient) ─────────────────────────────────── */
router.delete('/:id', protect, patientOnly, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, patient: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    await report.deleteOne();
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── Get patient by patientId (Doctor) ───────────────────────── */
router.get('/patient/:patientId', protect, doctorOnly, async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId }).select('-password');
    if (!patient) return res.status(404).json({ success: false, message: 'No patient found with this ID' });

    const reports = await Report.find({ patient: patient._id }).sort({ testDate: -1 });

    // Log access
    await Doctor.findByIdAndUpdate(req.user._id, {
      $push: { accessLog: { patientId: req.params.patientId } },
    });

    res.json({ success: true, patient, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── Add doctor comment to a report ─────────────────────────── */
router.post('/:id/comment', protect, doctorOnly, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          doctorComments: { doctorId: req.user._id, doctorName: req.user.name, comment: req.body.comment },
        },
      },
      { new: true }
    );
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
