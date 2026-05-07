const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const { generateToken } = require("../middleware/auth");
const { uploadDocs } = require("../config/cloudinary");

/* ─────────────────────────────────────────────────────────────────
   PATIENT
───────────────────────────────────────────────────────────────── */
router.post("/patient/register", async (req, res) => {
  try {
    const { name, email, password, phone, dob, gender, bloodGroup, address } =
      req.body;

    if (await Patient.findOne({ email }))
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const patient = await Patient.create({
      name,
      email,
      password,
      phone,
      dob,
      gender,
      bloodGroup,
      address,
    });
    const token = generateToken(patient._id, "patient");

    res.status(201).json({
      success: true,
      token,
      user: {
        id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        email: patient.email,
        role: "patient",
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/patient/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });
    if (!patient || !(await patient.matchPassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const token = generateToken(patient._id, "patient");
    res.json({
      success: true,
      token,
      user: {
        id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        email: patient.email,
        role: "patient",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   DOCTOR
───────────────────────────────────────────────────────────────── */
router.post(
  "/doctor/register",
  uploadDocs.fields([
    { name: "degreeFile", maxCount: 1 },
    { name: "licenseFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        specialization,
        licenseNumber,
        experience,
        hospital,
        bio,
      } = req.body;

      if (await Doctor.findOne({ email }))
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });
      if (await Doctor.findOne({ licenseNumber }))
        return res.status(400).json({
          success: false,
          message: "License number already registered",
        });

      const data = {
        name,
        email,
        password,
        phone,
        specialization,
        licenseNumber,
        experience,
        hospital,
        bio,
      };
      if (req.files?.degreeFile) data.degreeFile = req.files.degreeFile[0].path;
      if (req.files?.licenseFile)
        data.licenseFile = req.files.licenseFile[0].path;

      const doctor = await Doctor.create(data);
      const token = generateToken(doctor._id, "doctor");

      res.status(201).json({
        success: true,
        token,
        user: {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization,
          verificationStatus: doctor.verificationStatus,
          role: "doctor",
        },
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

router.post("/doctor/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor || !(await doctor.matchPassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const token = generateToken(doctor._id, "doctor");
    res.json({
      success: true,
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        verificationStatus: doctor.verificationStatus,
        role: "doctor",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
