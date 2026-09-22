const nodemailer = require('nodemailer');

// Mapeo amigable de estados
const NOMBRES_ESTADOS = {
  PENDIENTE: 'Recibido (Pendiente de preparación)',
  EN_PREPARACION: 'En Horno (Preparando tu pedido artesanal)',
  ENVIADO: 'En Camino (El domiciliario va hacia tu dirección)',
  ENTREGADO: 'Entregado con éxito',
  CANCELADO: 'Pedido Cancelado'
};

const COLORES_ESTADOS = {
  PENDIENTE: '#d97706',
  EN_PREPARACION: '#1d4ed8',
  ENVIADO: '#4338ca',
  ENTREGADO: '#15803d',
  CANCELADO: '#b91c1c'
};

const enviarNotificacionCambioEstado = async (pedido, nuevoEstado) => {
  try {
    const estadoNombre = NOMBRES_ESTADOS[nuevoEstado] || nuevoEstado;
    const colorEstado = COLORES_ESTADOS[nuevoEstado] || '#e76e55';
    const emailDestino = pedido.cliente?.email;

    if (!emailDestino) {
      console.log(`[Email] Pedido ${pedido.codigo}: No hay email asociado para notificar.`);
      return;
    }

    const htmlContent = `
      <div style="font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #e76e55 0%, #d65a41 100%); color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🥐 Pan de Casa</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">El sabor de la tradición en cada rebanada</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <h2 style="margin-top: 0; font-size: 20px; color: #1e293b;">¡Hola, ${pedido.cliente.nombre}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #64748b;">
            Te informamos que tu pedido <strong>#${pedido.codigo || `PED-${pedido.id}`}</strong> ha cambiado de estado:
          </p>
          <div style="background: #f8fafc; border-left: 4px solid ${colorEstado}; padding: 14px 18px; border-radius: 6px; margin: 20px 0;">
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: bold;">Nuevo Estado:</span>
            <div style="font-size: 18px; font-weight: bold; color: ${colorEstado}; margin-top: 4px;">${estadoNombre}</div>
          </div>
          <h3 style="font-size: 16px; margin-bottom: 8px; color: #1e293b;">Resumen del Pedido</h3>
          <ul style="padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
            ${(pedido.detalles || [])
              .map(
                (d) =>
                  `<li><strong>${d.cantidad}x</strong> ${d.producto?.nombre || 'Producto'} - $ ${Number(d.subtotal).toLocaleString('es-CO')}</li>`
              )
              .join('')}
          </ul>
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 16px; font-weight: bold; color: #e76e55;">
            Total: $ ${Number(pedido.total).toLocaleString('es-CO')}
          </div>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 24px; text-align: center;">
            Dirección de entrega: ${pedido.direccionEnvio} | Método: ${pedido.metodoPago}
          </p>
        </div>
      </div>
    `;

    // Intentar envío simulado o real si hay credenciales configuradas
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: '"Pan de Casa Artesanal" <no-reply@pandecasa.com>',
        to: emailDestino,
        subject: `Actualización de tu pedido #${pedido.codigo || pedido.id}: ${estadoNombre}`,
        html: htmlContent
      });
      console.log(`[Email] Correo enviado a ${emailDestino} para pedido ${pedido.codigo}`);
    } else {
      console.log(`[Email Simulado] Notificación de estado generada para ${emailDestino}: ${estadoNombre} (Pedido ${pedido.codigo || pedido.id})`);
    }
  } catch (error) {
    // Regla de resiliencia: la falla de correo no detiene la operación en BD
    console.warn(`[Email Warning] No se pudo enviar el correo de notificación: ${error.message}`);
  }
};

module.exports = {
  enviarNotificacionCambioEstado
};
