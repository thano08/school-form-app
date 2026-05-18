import store from '../../lib/sigStore';

export default function handler(req, res) {
  res.json({ ...store });
}
