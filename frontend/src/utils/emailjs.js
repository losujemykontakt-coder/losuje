import emailjs from 'emailjs-com';

// Konfiguracja EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_xowrmr5', // nowy Service ID
  TEMPLATE_ID: 'template_hgrvkh1', // template resetowania hasła
  USER_ID: 'qERa62uqOoAY701hk' // Public Key użytkownika
};

// Inicjalizacja EmailJS
export const initEmailJS = () => {
  try {
    emailjs.init(EMAILJS_CONFIG.USER_ID);
    console.log('EmailJS zainicjalizowany pomyślnie');
  } catch (error) {
    console.error('Błąd inicjalizacji EmailJS:', error);
  }
};

// Funkcja wysyłania emaila resetowania hasła
export const sendPasswordResetEmail = async (userEmail, resetToken, userName) => {
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

  const templateParams = {
    to_email: userEmail,
    to_name: userName || 'Użytkowniku',
    reset_link: resetLink,
    user_email: userEmail
  };

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('Email wysłany pomyślnie:', response);
    return { success: true };
  } catch (error) {
    console.error('Błąd wysyłania emaila:', error);
    return { success: false, error: error.message };
  }
};

// Funkcja wysyłania emaila potwierdzenia zmiany hasła
export const sendPasswordChangedEmail = async (userEmail, userName) => {
  const templateParams = {
    to_email: userEmail,
    to_name: userName || 'Użytkowniku',
    user_email: userEmail
  };

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      'template_84bzd5p', // template zmiany hasła
      templateParams
    );

    console.log('Email potwierdzenia wysłany:', response);
    return { success: true };
  } catch (error) {
    console.error('Błąd wysyłania emaila potwierdzenia:', error);
    return { success: false, error: error.message };
  }
};

// Funkcja wysyłania emaila kontaktowego
export const sendContactEmail = async (name, email, message) => {
  const templateParams = {
    to_email: 'losujemy.kontakt@gmail.com',
    from_name: name,
    from_email: email,
    message: message,
    subject: `Nowa wiadomość kontaktowa od ${name}`,
    date: new Date().toLocaleString('pl-PL')
  };

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      'template_hgrvkh1', // tymczasowo używamy istniejącego template'u
      templateParams
    );

    console.log('Email kontaktowy wysłany:', response);
    return { success: true };
  } catch (error) {
    console.error('Błąd wysyłania emaila kontaktowego:', error);
    console.error('Szczegóły błędu:', {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: 'template_hgrvkh1',
      userId: EMAILJS_CONFIG.USER_ID,
      error: error.message
    });
    return { success: false, error: error.message || 'Nieznany błąd' };
  }
}; 
