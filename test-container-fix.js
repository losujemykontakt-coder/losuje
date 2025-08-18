const puppeteer = require('puppeteer');

async function testPayPalContainer() {
  console.log('🧪 Test naprawy błędu kontenera PayPal...\n');

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
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Przejdź do strony płatności
    console.log('1️⃣ Przechodzę do strony płatności...');
    await page.goto('http://localhost:3000/payments', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Poczekaj na załadowanie PayPal
    console.log('2️⃣ Czekam na załadowanie PayPal...');
    await page.waitForTimeout(5000);

    // Sprawdź czy kontener PayPal istnieje
    console.log('3️⃣ Sprawdzam czy kontener PayPal istnieje...');
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
    console.log('4️⃣ Sprawdzam błędy w konsoli...');
    const containerErrors = errors.filter(error => 
      error.includes('container') || 
      error.includes('DOM') || 
      error.includes('PayPal')
    );

    if (containerErrors.length > 0) {
      console.log('❌ Znaleziono błędy kontenera:');
      containerErrors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ Brak błędów kontenera!');
    }

    // Sprawdź czy przyciski PayPal są widoczne
    console.log('5️⃣ Sprawdzam czy przyciski PayPal są widoczne...');
    const paypalButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('[data-funding-source]');
      return buttons.length;
    });

    console.log(`📊 Znaleziono ${paypalButtons} przycisków PayPal`);

    // Podsumowanie
    console.log('\n🎯 PODSUMOWANIE TESTU:');
    console.log('✅ Kontener istnieje:', containerExists.exists);
    console.log('✅ Kontener ma zawartość:', containerExists.hasContent);
    console.log('✅ Wysokość kontenera:', containerExists.height, 'px');
    console.log('✅ Przyciski PayPal:', paypalButtons > 0 ? 'TAK' : 'NIE');
    console.log('✅ Błędy kontenera:', containerErrors.length === 0 ? 'BRAK' : containerErrors.length);

    if (containerExists.exists && containerExists.hasContent && paypalButtons > 0 && containerErrors.length === 0) {
      console.log('\n🎉 TEST PRZESZŁ POMYŚLNIE!');
      console.log('✅ Błąd kontenera PayPal został naprawiony!');
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
testPayPalContainer();

