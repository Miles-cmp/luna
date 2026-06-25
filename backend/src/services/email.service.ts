import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

function base(content: string) {
  return `
    <div style="font-family:'Segoe UI',sans-serif;max-width:540px;margin:0 auto;background:#0f1117;border-radius:14px;overflow:hidden;color:#e2e8f0">
      ${content}
      <div style="padding:16px 28px;font-size:11px;color:#475569;border-top:1px solid #2e3347">
        CMP - Luna · Este es un correo automático, no respondas.
      </div>
    </div>
  `;
}

function header(icon: string, bg: string, label: string, titulo: string) {
  return `
    <div style="background:${bg};padding:24px 28px">
      <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:.5px;text-transform:uppercase">${icon} ${label}</p>
      <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff">${titulo}</h1>
    </div>
  `;
}

function detalle(opts: { descripcion?: string; lugar?: string; inicio: string; fin: string; integrantes?: string[] }) {
  return `
    <div style="padding:20px 28px;display:flex;flex-direction:column;gap:14px">
      ${opts.descripcion ? `<p style="margin:0;font-size:14px;color:#cbd5e1">${opts.descripcion}</p>` : ''}
      <table style="border-collapse:collapse;font-size:13px">
        <tr>
          <td style="padding:5px 16px 5px 0;color:#64748b;white-space:nowrap">🕐 Inicio</td>
          <td style="color:#e2e8f0">${opts.inicio}</td>
        </tr>
        <tr>
          <td style="padding:5px 16px 5px 0;color:#64748b;white-space:nowrap">🏁 Fin</td>
          <td style="color:#e2e8f0">${opts.fin}</td>
        </tr>
        ${opts.lugar ? `<tr><td style="padding:5px 16px 5px 0;color:#64748b;white-space:nowrap">📍 Lugar</td><td style="color:#e2e8f0">${opts.lugar}</td></tr>` : ''}
        ${opts.integrantes?.length ? `<tr><td style="padding:5px 16px 5px 0;color:#64748b;white-space:nowrap">👥 Equipo</td><td style="color:#e2e8f0">${opts.integrantes.join(', ')}</td></tr>` : ''}
      </table>
    </div>
  `;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'full', timeStyle: 'short' });
}

// ── 1. Asignación ─────────────────────────────────────────────────────────────
export async function enviarAsignacion(opts: {
  to: string[];
  titulo: string;
  descripcion?: string;
  lugar?: string;
  fecha_inicio: string;
  fecha_fin: string;
  creador: string;
  integrantes?: string[];
}) {
  const html = base(
    header('📋', '#6366f1', 'Nueva tarea asignada', opts.titulo) +
    detalle({ descripcion: opts.descripcion, lugar: opts.lugar, inicio: fmt(opts.fecha_inicio), fin: fmt(opts.fecha_fin), integrantes: opts.integrantes }) +
    `<div style="padding:0 28px 20px"><p style="margin:0;font-size:12px;color:#64748b">Asignada por <strong style="color:#818cf8">${opts.creador}</strong></p></div>`
  );

  await getTransporter().sendMail({
    from: `"CMP - Luna" <${process.env.GMAIL_USER}>`,
    to: opts.to.join(', '),
    subject: `📋 Tarea asignada: ${opts.titulo}`,
    html,
  });
}

// ── 2. Recordatorio de inicio ──────────────────────────────────────────────
export async function enviarRecordatorio(opts: {
  to: string[];
  titulo: string;
  descripcion?: string;
  lugar?: string;
  fecha_inicio: string;
  fecha_fin: string;
  recordatorio_min: number;
}) {
  const mins = opts.recordatorio_min;
  const cuanto = mins >= 60 ? `${mins / 60} hora${mins / 60 > 1 ? 's' : ''}` : `${mins} minuto${mins > 1 ? 's' : ''}`;

  const html = base(
    header('⏰', '#f59e0b', `Comienza en ${cuanto}`, opts.titulo) +
    detalle({ descripcion: opts.descripcion, lugar: opts.lugar, inicio: fmt(opts.fecha_inicio), fin: fmt(opts.fecha_fin) })
  );

  await getTransporter().sendMail({
    from: `"CMP - Luna" <${process.env.GMAIL_USER}>`,
    to: opts.to.join(', '),
    subject: `⏰ Recordatorio: ${opts.titulo} — en ${cuanto}`,
    html,
  });
}

// ── 3. Notificación de finalización ───────────────────────────────────────
export async function enviarFinalizacion(opts: {
  to: string[];
  titulo: string;
  descripcion?: string;
  fecha_fin: string;
}) {
  const html = base(
    header('🏁', '#22c55e', 'Tarea finalizada', opts.titulo) +
    `<div style="padding:20px 28px;font-size:14px;color:#cbd5e1">
      ${opts.descripcion ? `<p style="margin:0 0 12px">${opts.descripcion}</p>` : ''}
      <p style="margin:0;color:#64748b">⏱ Finalizó el <strong style="color:#4ade80">${fmt(opts.fecha_fin)}</strong></p>
    </div>`
  );

  await getTransporter().sendMail({
    from: `"CMP - Luna" <${process.env.GMAIL_USER}>`,
    to: opts.to.join(', '),
    subject: `🏁 Tarea finalizada: ${opts.titulo}`,
    html,
  });
}
