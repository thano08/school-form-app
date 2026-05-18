export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'auth=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.json({ success: true });
}
