import { connectDB } from '../../../lib/mongodb';
import Application from '../../../lib/Application';

const VALID_ROLES = ['thalaivar', 'porulaalar', 'seyalaalar'];

export default async function handler(req, res) {
  const role = req.cookies?.auth;
  if (!VALID_ROLES.includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  await connectDB();

  if (req.method === 'GET') {
    const app = await Application.findById(req.query.id);
    if (!app) return res.status(404).json({ error: 'Not found' });
    return res.json(app);
  }

  if (req.method === 'DELETE') {
    await Application.findByIdAndDelete(req.query.id);
    return res.json({ success: true });
  }

  res.status(405).end();
}
