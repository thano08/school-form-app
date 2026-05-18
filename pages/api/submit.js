import { connectDB } from '../../lib/mongodb';
import Application from '../../lib/Application';
import store from '../../lib/sigStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const doc = await Application.create(req.body);

    // Clear in-memory officer signatures after each submission
    store.thalaivar = '';
    store.porulaalar = '';
    store.seyalaalar = '';

    res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
