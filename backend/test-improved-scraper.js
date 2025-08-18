const { updateGameStats, fetchLottoResults, calculateStats } = require('./improved-scraper');

async function testScraper() {
  console.log('🧪 Test ulepszonego scrapera...');
  
  try {
    // Test pobierania wyników
    console.log('📊 Test pobierania wyników dla lotto...');
    const results = await fetchLottoResults('lotto');
    console.log(`✅ Pobrano ${results.length} wyników`);
    
    if (results.length > 0) {
      console.log('📊 Przykładowe wyniki:');
      console.log(results.slice(0, 3));
      
      // Test obliczania statystyk
      console.log('📈 Test obliczania statystyk...');
      const stats = calculateStats(results, 'lotto');
      console.log('✅ Statystyki obliczone:');
      console.log(`- Liczba losowań: ${stats.totalDraws}`);
      console.log(`- Średnia suma: ${stats.avgSum}`);
      console.log(`- Gorące liczby: ${stats.hotNumbers?.join(', ')}`);
      console.log(`- Zimne liczby: ${stats.coldNumbers?.join(', ')}`);
    }
    
    // Test aktualizacji statystyk
    console.log('🔄 Test aktualizacji statystyk...');
    const success = await updateGameStats('lotto');
    console.log(`✅ Aktualizacja: ${success ? 'sukces' : 'błąd'}`);
    
  } catch (error) {
    console.error('❌ Błąd testu:', error.message);
  }
}

testScraper();

