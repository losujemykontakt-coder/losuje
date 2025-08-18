const nodemailer = require('nodemailer');
const config = require('./config');

// Konfiguracja transportera email
const transporter = nodemailer.createTransport({
  host: config.EMAIL.HOST,
  port: config.EMAIL.PORT,
  secure: false, // true dla 465, false dla innych portów
  auth: {
    user: config.EMAIL.USER,
    pass: config.EMAIL.PASS
  }
});

// Funkcja wysyłania emaila resetowania hasła
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: config.EMAIL.FROM,
    to: email,
    subject: 'Resetowanie hasła - Lotek Generator',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%); padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: #222; margin: 0;">🎰 Lotek Generator</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Resetowanie hasła</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Witaj ${userName || 'Użytkowniku'}!
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Otrzymaliśmy prośbę o resetowanie hasła do Twojego konta w Lotek Generator.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Zresetuj hasło
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Jeśli nie prosiłeś o resetowanie hasła, zignoruj ten email.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Link jest ważny przez 1 godzinę.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            To jest automatyczny email. Nie odpowiadaj na tę wiadomość.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Błąd wysyłania emaila:', error);
    return { success: false, error: error.message };
  }
};

// Funkcja wysyłania emaila potwierdzenia zmiany hasła
const sendPasswordChangedEmail = async (email, userName) => {
  const mailOptions = {
    from: config.EMAIL.FROM,
    to: email,
    subject: 'Hasło zostało zmienione - Lotek Generator',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎰 Lotek Generator</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">✅ Hasło zostało zmienione</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Witaj ${userName || 'Użytkowniku'}!
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Twoje hasło zostało pomyślnie zmienione. Jeśli to nie Ty zmieniłeś hasło, 
            natychmiast skontaktuj się z naszym zespołem wsparcia.
          </p>
          
          <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #2e7d32; margin: 0; font-weight: bold;">
              🔒 Twoje konto jest bezpieczne
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            To jest automatyczny email. Nie odpowiadaj na tę wiadomość.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Błąd wysyłania emaila:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangedEmail
}; 