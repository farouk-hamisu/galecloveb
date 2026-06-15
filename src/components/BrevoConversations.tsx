import { useEffect } from 'react';
// Extend Window interface to include Brevo properties
declare global {
  interface Window {
    BrevoConversationsID?: string;
    BrevoConversations?: any;
  }
}

const BrevoConversations = () => {
  useEffect(() => {
    (function(d, w, c) {
      w.BrevoConversationsID ='6a2fb1334d37609f4b0a5017';
      w[c] = w[c] || function() {
        (w[c].q = w[c].q || []).push(arguments);
      };
      const s = d.createElement('script');
      s.async = true;
      s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
      if (d.head) d.head.appendChild(s);
    })(document, window, 'BrevoConversations');
  }, []);

  return null;
};
export default BrevoConversations;

