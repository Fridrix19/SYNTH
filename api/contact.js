const nodemailer = require('nodemailer');

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'fedorhavalic@gmail.com';

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

function parseBody(req) {
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8'));
    } catch {
      return {};
    }
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object') return body;
  return {};
}

async function sendViaWeb3Forms({ name, email, message }) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) return { ok: false, skip: true };

  const r = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `[SYNTH] Сообщение от ${name}`,
      name,
      email,
      message: `${message}\n\n---\nИмя: ${name}\nEmail для ответа: ${email}`,
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.success) {
    const err = data.message || data.error || 'Web3Forms отклонил запрос';
    throw new Error(typeof err === 'string' ? err : 'Ошибка Web3Forms');
  }
  return { ok: true };
}

async function sendViaSmtp({ name, email, message }) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return { ok: false, skip: true };

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"SYNTH сайт" <${user}>`,
    to: TO_EMAIL,
    replyTo: email,
    subject: `[SYNTH] Сообщение от ${name}`,
    text: `${message}\n\n---\nИмя: ${name}\nEmail для ответа: ${email}`,
    html: `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p><hr><p>Имя: ${escapeHtml(name)}<br>Email: ${escapeHtml(email)}</p>`,
  });
  return { ok: true };
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = parseBody(req);
  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 200);
  const message = String(body.message || '').trim().slice(0, 8000);

  if (name.length < 2) {
    return res.status(400).json({ ok: false, error: 'Укажите имя' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Укажите корректный email' });
  }
  if (message.length < 10) {
    return res.status(400).json({ ok: false, error: 'Сообщение не короче 10 символов' });
  }

  const payload = { name, email, message };

  try {
    const w3 = await sendViaWeb3Forms(payload);
    if (w3.ok) return res.status(200).json({ ok: true });

    const smtp = await sendViaSmtp(payload);
    if (smtp.ok) return res.status(200).json({ ok: true });

    console.error('Contact: задайте WEB3FORMS_ACCESS_KEY или SMTP_USER/SMTP_PASS в переменных окружения');
    return res.status(503).json({
      ok: false,
      error:
        'Почта не настроена на сервере. В Vercel добавьте WEB3FORMS_ACCESS_KEY (web3forms.com) или SMTP_USER и SMTP_PASS.',
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Не удалось отправить письмо' });
  }
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
