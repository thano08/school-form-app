import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: String,
  nicNumber: String,
  phone: String,
  whatsapp: String,
  studyYearFrom: String,
  studyYearTo: String,
  studyPeriodFrom: String,
  studyPeriodTo: String,
  occupation: String,
  familyStatus: String,
  signature: String,
  membershipNumber: String,
  receiptNumber: String,
  sigThalaivar: { type: String, default: '' },
  sigPorulaalar: { type: String, default: '' },
  sigSeyalaalar: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
