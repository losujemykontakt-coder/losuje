const puppeteer = require('puppeteer');

async function testPaymentsFix() {
  console.log('🧪 Test naprawy problemów z płatnościami...\n');

  let browser;
  try {
    // Uruchom przeglądarkę
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1280, height: 720 }
    });
    
    const page = await browser.newPage();
    
    // Przechwyć błędy konsoli
    const errors = [];
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else {
        logs.push(msg.text());
      }
    });

    // Przejdź do strony płatności
    console.log('1️⃣ Przechodzę do strony płatności...');
    await page.goto('http://localhost:3000/payments', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Poczekaj na załadowanie
    console.log('2️⃣ Czekam na załadowanie strony...');
    await page.waitForTimeout(3000);

    // Sprawdź czy jesteśmy na stronie płatności
    console.log('3️⃣ Sprawdzam czy jestem na stronie płatności...');
    const currentUrl = page.url();
    console.log('📊 Aktualny URL:', currentUrl);

    if (currentUrl.includes('/payments')) {
      console.log('✅ Jesteśmy na stronie płatności');
    } else {
      console.log('❌ Przekierowano z /payments do:', currentUrl);
    }

    // Sprawdź czy kontener PayPal istnieje
    console.log('4️⃣ Sprawdzam czy kontener PayPal istnieje...');
    const containerExists = await page.evaluate(() => {
      const container = document.getElementById('paypal-button-container');
      return {
        exists: !!container,
        hasContent: container ? container.innerHTML.length > 0 : false,
        height: container ? container.offsetHeight : 0
      };
    });

    console.log('📊 Status kontenera:', containerExists);

    // Sprawdź błędy w konsoli
    console.log('5️⃣ Sprawdzam błędy w konsoli...');
    const containerErrors = errors.filter(error => 
      error.includes('container') || 
      error.includes('DOM') || 
      error.includes('PayPal')
    );

    const redirectLogs = logs.filter(log => 
      log.includes('Catch-all route') || 
      log.includes('przekierowanie')
    );

    if (containerErrors.length > 0) {
      console.log('❌ Znaleziono błędy kontenera:');
      containerErrors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ Brak błędów kontenera!');
    }

    if (redirectLogs.length > 0) {
      console.log('⚠️ Znaleziono logi przekierowań:');
      redirectLogs.forEach(log => console.log('  -', log));
    } else {
      console.log('✅ Brak logów przekierowań!');
    }

    // Sprawdź czy przyciski PayPal są widoczne
    console.log('6️⃣ Sprawdzam czy przyciski PayPal są widoczne...');
    const paypalButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('[data-funding-source]');
      return buttons.length;
    });

    console.log(`📊 Znaleziono ${paypalButtons} przycisków PayPal`);

    // Sprawdź czy strona zawiera tekst "Płatności"
    console.log('7️⃣ Sprawdzam czy strona zawiera tekst "Płatności"...');
    const hasPaymentsText = await page.evaluate(() => {
      return document.body.innerText.includes('Płatności');
    });

    console.log('📊 Strona zawiera tekst "Płatności":', hasPaymentsText);

    // Podsumowanie
    console.log('\n🎯 PODSUMOWANIE TESTU:');
    console.log('✅ URL płatności:', currentUrl.includes('/payments'));
    console.log('✅ Kontener istnieje:', containerExists.exists);
    console.log('✅ Kontener ma zawartość:', containerExists.hasContent);
    console.log('✅ Wysokość kontenera:', containerExists.height, 'px');
    console.log('✅ Przyciski PayPal:', paypalButtons > 0 ? 'TAK' : 'NIE');
    console.log('✅ Błędy kontenera:', containerErrors.length === 0 ? 'BRAK' : containerErrors.length);
    console.log('✅ Przekierowania:', redirectLogs.length === 0 ? 'BRAK' : redirectLogs.length);
    console.log('✅ Tekst "Płatności":', hasPaymentsText ? 'TAK' : 'NIE');

    if (currentUrl.includes('/payments') && containerExists.exists && containerExists.hasContent && paypalButtons > 0 && containerErrors.length === 0 && redirectLogs.length === 0 && hasPaymentsText) {
      console.log('\n🎉 TEST PRZESZŁ POMYŚLNIE!');
      console.log('✅ Wszystkie problemy z płatnościami zostały naprawione!');
    } else {
      console.log('\n❌ TEST NIE PRZESZŁ');
      console.log('🔧 Wymagane dodatkowe naprawy');
    }

  } catch (error) {
    console.error('\n❌ Błąd podczas testowania:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Uruchom test
testPaymentsFix();

