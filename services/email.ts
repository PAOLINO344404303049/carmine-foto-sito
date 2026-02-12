
import { Order } from '../types';
import { STUDIO_ADDRESS, STUDIO_PHONE } from '../constants';

/**
 * Servizio per la gestione delle notifiche email.
 * In un ambiente di produzione, queste funzioni chiamerebbero un'API backend
 * o un servizio come EmailJS / SendGrid.
 */
export const EmailService = {
  /**
   * Invia email di conferma ricezione ordine
   */
  sendOrderConfirmation: async (order: Order) => {
    console.log(`[EMAIL] Invio conferma ordine a: ${order.userEmail}`);
    
    const template = `
      Ciao ${order.userName},
      abbiamo ricevuto correttamente il tuo ordine fotografico.

      Riepilogo ordine:
      - ID Ordine: ${order.id}
      - Pacchetto: ${order.packageName}
      - Numero foto caricate: ${order.photos.length}
      - Data ordine: ${new Date(order.createdAt).toLocaleDateString('it-IT')}
      - Totale: €${order.total.toFixed(2)}

      Ti avviseremo tramite email quando le stampe saranno pronte per il ritiro in studio.

      📍 Ritiro esclusivamente presso lo studio:
      ${STUDIO_ADDRESS}

      Grazie per aver scelto
      Carmine Felice Napolitano – Fotografo
    `;

    // Simulazione chiamata API
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("%c EMAIL INVIATA (CONFERMA) ", "background: #000; color: #fff; font-weight: bold;");
        console.log(template);
        resolve({ success: true });
      }, 1000);
    });
  },

  /**
   * Invia email di notifica "Pronto per il ritiro"
   */
  sendCollectionReady: async (order: Order) => {
    console.log(`[EMAIL] Invio notifica ritiro a: ${order.userEmail}`);

    const template = `
      Ciao ${order.userName},
      le tue foto sono pronte 🎉

      Puoi venire a ritirarle presso il nostro studio fotografico:

      📍 ${STUDIO_ADDRESS}

      Per qualsiasi informazione puoi contattarci su WhatsApp:
      📱 ${STUDIO_PHONE}

      Grazie ancora,
      Carmine Felice Napolitano – Fotografo
    `;

    // Simulazione chiamata API
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("%c EMAIL INVIATA (RITIRO) ", "background: #22c55e; color: #fff; font-weight: bold;");
        console.log(template);
        resolve({ success: true });
      }, 1000);
    });
  }
};
