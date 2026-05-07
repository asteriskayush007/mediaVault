const jwt     = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor  = require('../models/Doctor');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Not authorised — no token' });

  try {
    const { id, role } = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    if (role === 'patient') {
      req.user = await Patient.findById(id).select('-password');
      req.role = 'patient';
    } else {
      req.user = await Doctor.findById(id).select('-password');
      req.role = 'doctor';
    }
    if (!req.user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
};

const doctorOnly = (req, res, next) => {
  if (req.role !== 'doctor')
    return res.status(403).json({ success: false, message: 'Doctors only' });
  next();
};

const patientOnly = (req, res, next) => {
  if (req.role !== 'patient')
    return res.status(403).json({ success: false, message: 'Patients only' });
  next();
};

module.exports = { generateToken, protect, doctorOnly, patientOnly };
