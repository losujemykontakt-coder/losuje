const { scrapeLottoResults, updateGameStats, fetchLottoAPI, fetchLatestResults } = require('./scraper');

async function testImprovedScraper() {
  console.log('🧪 Testowanie zaktualizowanego scrapera...');
  
  const games = ['lotto', 'miniLotto', 'multiMulti', 'eurojackpot'];
  
  for (const game of games) {
    console.log(`\n🎯 Testowanie gry: ${game}`);
    console.log('='.repeat(50));
    
    try {
      // Test 1: Pobieranie wyników przez web scraping
      console.log(`\n📊 Test 1: Pobieranie wyników ${game} przez web scraping...`);
      const results = await fetchLottoAPI(game);
      
      if (results && results.length > 0) {
        console.log(`✅ Pobrano ${results.length} wyników dla ${game}`);
        console.log('Przykładowe wyniki:');
        results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. Liczby: ${result.numbers.join(', ')}, Data: ${result.drawDate}`);
        });
      } else {
        console.log(`❌ Nie udało się pobrać wyników dla ${game}`);
      }
      
      // Test 2: Pobieranie najnowszych wyników
      console.log(`\n📊 Test 2: Pobieranie najnowszych wyników ${game}...`);
      const latestResults = await fetchLatestResults(game, 0);
      
      if (latestResults && latestResults.length > 0) {
        console.log(`✅ Pobrano ${latestResults.length} najnowszych wyników dla ${game}`);
        console.log('Przykładowe wyniki:');
        latestResults.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. Data: ${result.date}, Liczby: ${result.numbers.join(', ')}, Suma: ${result.sum}`);
        });
      } else {
        console.log(`❌ Nie udało się pobrać najnowszych wyników dla ${game}`);
      }
      
      // Test 3: Aktualizacja statystyk
      console.log(`\n🔄 Test 3: Aktualizacja statystyk dla ${game}...`);
      const success = await updateGameStats(game);
      
      if (success) {
        console.log(`✅ Statystyki dla ${game} zostały zaktualizowane pomyślnie`);
      } else {
        console.log(`❌ Błąd aktualizacji statystyk dla ${game}`);
      }
      
      // Małe opóźnienie między testami
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`💥 Błąd testowania ${game}:`, error.message);
    }
  }
  
  console.log('\n🎉 Zakończono testowanie wszystkich gier!');
}

// Funkcja do testowania konkretnej gry
async function testSpecificGame(gameType) {
  console.log(`🧪 Testowanie konkretnej gry: ${gameType}`);
  
  try {
    // Test web scraping
    console.log(`\n📊 Test web scraping dla ${gameType}...`);
    const results = await fetchLottoAPI(gameType);
    
    if (results && results.length > 0) {
      console.log(`✅ Pobrano ${results.length} wyników dla ${gameType}`);
      console.log('Przykładowe wyniki:');
      results.slice(0, 5).forEach((result, index) => {
        console.log(`  ${index + 1}. Liczby: ${result.numbers.join(', ')}, Data: ${result.drawDate}`);
      });
    } else {
      console.log(`❌ Nie udało się pobrać wyników dla ${gameType}`);
    }
    
  } catch (error) {
    console.error(`💥 Błąd testowania ${gameType}:`, error.message);
  }
}

// Sprawdź argumenty linii poleceń
const args = process.argv.slice(2);
if (args.length > 0) {
  const gameType = args[0];
  testSpecificGame(gameType);
} else {
  testImprovedScraper();
} 