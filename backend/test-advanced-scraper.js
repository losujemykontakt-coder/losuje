const { updateGameStatsAdvanced, fetchLottoResultsAdvanced, calculateStatsAdvanced } = require('./advanced-scraper');

async function testAdvancedScraper() {
  console.log('🧪 Test zaawansowanego scrapera...');
  
  try {
    // Test pobierania wyników
    console.log('📊 Test pobierania wyników dla lotto...');
    const results = await fetchLottoResultsAdvanced('lotto');
    console.log(`✅ Pobrano ${results.length} wyników`);
    
    if (results.length > 0) {
      console.log('📊 Przykładowe wyniki:');
      console.log(results.slice(0, 5));
      
      // Test obliczania statystyk
      console.log('📈 Test obliczania statystyk...');
      const stats = calculateStatsAdvanced(results, 'lotto');
      console.log('✅ Statystyki obliczone:');
      console.log(`- Liczba losowań: ${stats.totalDraws}`);
      console.log(`- Średnia suma: ${stats.avgSum}`);
      console.log(`- Gorące liczby: ${stats.hotNumbers?.join(', ')}`);
      console.log(`- Zimne liczby: ${stats.coldNumbers?.join(', ')}`);
      console.log(`- Wzorce: ${JSON.stringify(stats.patterns)}`);
    }
    
    // Test aktualizacji statystyk
    console.log('🔄 Test aktualizacji statystyk...');
    const success = await updateGameStatsAdvanced('lotto');
    console.log(`✅ Aktualizacja: ${success ? 'sukces' : 'błąd'}`);
    
  } catch (error) {
    console.error('❌ Błąd testu:', error.message);
  }
}

testAdvancedScraper();

