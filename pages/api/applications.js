import { connectDB } from '../../lib/mongodb';
import Application from '../../lib/Application';

const VALID_ROLES = ['thalaivar', 'porulaalar', 'seyalaalar'];

export default async function handler(req, res) {
  const role = req.cookies?.auth;
  if (!VALID_ROLES.includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();
  const apps = await Application.find({}, {
    fullName: 1, membershipNumber: 1, submittedAt: 1,
    sigThalaivar: 1, sigPorulaalar: 1, sigSeyalaalar: 1
  }).sort({ submittedAt: -1 });

  res.json(apps);
}
