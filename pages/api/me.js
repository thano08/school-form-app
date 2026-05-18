const VALID_ROLES = ['thalaivar', 'porulaalar', 'seyalaalar'];

export default function handler(req, res) {
  const role = req.cookies?.auth;
  if (VALID_ROLES.includes(role)) {
    return res.json({ loggedIn: true, role });
  }
  res.json({ loggedIn: false, role: null });
}
