const express = require('express');
const router  = express.Router();
const Patient = require('../models/Patient');
const Doctor  = require('../models/Doctor');
const { protect, patientOnly, doctorOnly } = require('../middleware/auth');

/* ── Patient Profile ─────────────────────────────────────────── */
router.get('/patient', protect, patientOnly, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id).select('-password').populate('reports');
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/patient', protect, patientOnly, async (req, res) => {
  try {
    const { name, phone, dob, gender, bloodGroup, address, emergencyContact } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.user._id,
      { name, phone, dob, gender, bloodGroup, address, emergencyContact },
      { new: true }
    ).select('-password');
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── Doctor Profile ──────────────────────────────────────────── */
router.get('/doctor', protect, doctorOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id).select('-password');
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/doctor', protect, doctorOnly, async (req, res) => {
  try {
    const { name, phone, hospital, bio, experience } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.user._id,
      { name, phone, hospital, bio, experience },
      { new: true }
    ).select('-password');
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
