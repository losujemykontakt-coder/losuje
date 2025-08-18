const { scrapeLottoResults, updateGameStats } = require('./scraper');

async function testScraper() {
  console.log('🧪 Testowanie scrapera...');
  
  try {
    // Test pobierania wyników lotto
    console.log('\n📊 Testowanie pobierania wyników Lotto...');
    const lottoResults = await scrapeLottoResults('lotto');
    
    if (lottoResults.length > 0) {
      console.log(`✅ Pobrano ${lottoResults.length} wyników Lotto`);
      console.log('Przykładowe wyniki:');
      lottoResults.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. Data: ${result.date}, Liczby: ${result.numbers.join(', ')}, Suma: ${result.sum}`);
      });
    } else {
      console.log('❌ Nie udało się pobrać wyników Lotto');
    }
    
    // Test aktualizacji statystyk
    console.log('\n🔄 Testowanie aktualizacji statystyk...');
    const success = await updateGameStats('lotto');
    
    if (success) {
      console.log('✅ Statystyki zostały zaktualizowane pomyślnie');
    } else {
      console.log('❌ Błąd aktualizacji statystyk');
    }
    
  } catch (error) {
    console.error('💥 Błąd testowania scrapera:', error);
  }
}

// Uruchom test
testScraper(); 