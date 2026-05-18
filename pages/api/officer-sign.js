import { connectDB } from '../../lib/mongodb';
import Application from '../../lib/Application';
import store from '../../lib/sigStore';

const ROLE_FIELD = {
  thalaivar: 'sigThalaivar',
  porulaalar: 'sigPorulaalar',
  seyalaalar: 'sigSeyalaalar',
};

const VALID_ROLES = ['thalaivar', 'porulaalar', 'seyalaalar'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const role = req.cookies?.auth;
  if (!VALID_ROLES.includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  const { signature, applicationId } = req.body;
  const field = ROLE_FIELD[role];

  // Update in-memory store
  store[role] = signature || '';

  // If applicationId provided, also persist to DB
  if (applicationId) {
    await connectDB();
    await Application.findByIdAndUpdate(applicationId, { [field]: signature || '' });
  }

  res.json({ success: true });
}
