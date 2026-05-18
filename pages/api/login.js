const USERS = {
  'president':  { password: 'president123',  role: 'thalaivar' },
  'treasurer':  { password: 'treasurer123',  role: 'porulaalar' },
  'secretary':  { password: 'secretary123',  role: 'seyalaalar' },
};

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;
  const user = USERS[username];

  if (user && user.password === password) {
    res.setHeader('Set-Cookie', `auth=${user.role}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res.json({ success: true, role: user.role });
  }

  return res.status(401).json({ success: false, error: 'தவறான பயனர்பெயர் அல்லது கடவுச்சொல்' });
}
