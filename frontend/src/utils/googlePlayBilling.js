// Google Play Billing API dla PWA
// Zgodny z dokumentacją Google Play Store

class GooglePlayBilling {
  constructor() {
    this.isAvailable = false;
    this.products = [];
    this.purchases = [];
    this.init();
  }

  async init() {
    try {
      // Sprawdź czy Google Play Billing jest dostępne
      if (window.google && window.google.play && window.google.play.billing) {
        this.isAvailable = true;
        await this.loadProducts();
        await this.loadPurchases();
        console.log('Google Play Billing zainicjalizowane');
      } else {
        console.log('Google Play Billing niedostępne - używaj w aplikacji mobilnej');
      }
    } catch (error) {
      console.error('Błąd inicjalizacji Google Play Billing:', error);
    }
  }

  // Definicje produktów zgodne z Google Play Store
  getProductDefinitions() {
    return [
      {
        id: 'premium_monthly',
        name: 'Premium Miesięczny',
        description: 'Dostęp premium na 1 miesiąc',
        price: '9.99 PLN',
        priceMicros: 9990000, // w mikrokopiejkach
        type: 'subscription'
      },
      {
        id: 'premium_yearly',
        name: 'Premium Roczny',
        description: 'Dostęp premium na 12 miesięcy (oszczędność 40%)',
        price: '59.99 PLN',
        priceMicros: 59990000,
        type: 'subscription'
      },
      {
        id: 'premium_lifetime',
        name: 'Premium Dożywotni',
        description: 'Dostęp premium na zawsze',
        price: '199.99 PLN',
        priceMicros: 199990000,
        type: 'oneTime'
      },
      {
        id: 'coins_100',
        name: '100 Monet',
        description: '100 monet do talizmanów',
        price: '4.99 PLN',
        priceMicros: 4990000,
        type: 'oneTime'
      },
      {
        id: 'coins_500',
        name: '500 Monet',
        description: '500 monet do talizmanów',
        price: '19.99 PLN',
        priceMicros: 19990000,
        type: 'oneTime'
      }
    ];
  }

  async loadProducts() {
    if (!this.isAvailable) {
      this.products = this.getProductDefinitions();
      return;
    }

    try {
      const productIds = this.getProductDefinitions().map(p => p.id);
      const response = await window.google.play.billing.getProducts(productIds);
      this.products = response.products || this.getProductDefinitions();
    } catch (error) {
      console.error('Błąd ładowania produktów:', error);
      this.products = this.getProductDefinitions();
    }
  }

  async loadPurchases() {
    if (!this.isAvailable) {
      // W PWA używaj localStorage
      const stored = localStorage.getItem('googlePlayPurchases');
      this.purchases = stored ? JSON.parse(stored) : [];
      return;
    }

    try {
      const response = await window.google.play.billing.getPurchases();
      this.purchases = response.purchases || [];
    } catch (error) {
      console.error('Błąd ładowania zakupów:', error);
      this.purchases = [];
    }
  }

  async purchaseProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Produkt nie znaleziony');
    }

    if (!this.isAvailable) {
      // Symulacja zakupu w PWA
      return this.simulatePurchase(product);
    }

    try {
      const purchase = await window.google.play.billing.purchaseProduct(productId);
      
      if (purchase.purchaseState === 'PURCHASED') {
        await this.acknowledgePurchase(purchase.purchaseToken);
        this.purchases.push(purchase);
        this.savePurchases();
        return purchase;
      } else {
        throw new Error('Zakup nie został zrealizowany');
      }
    } catch (error) {
      console.error('Błąd zakupu:', error);
      throw error;
    }
  }

  async simulatePurchase(product) {
    // Symulacja zakupu dla PWA
    const purchase = {
      productId: product.id,
      purchaseToken: 'simulated_' + Date.now(),
      purchaseTime: Date.now(),
      purchaseState: 'PURCHASED',
      orderId: 'simulated_order_' + Date.now(),
      isAcknowledged: false
    };

    this.purchases.push(purchase);
    this.savePurchases();
    
    // Symuluj opóźnienie
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return purchase;
  }

  async acknowledgePurchase(purchaseToken) {
    if (!this.isAvailable) {
      // W PWA oznacz jako potwierdzony
      const purchase = this.purchases.find(p => p.purchaseToken === purchaseToken);
      if (purchase) {
        purchase.isAcknowledged = true;
        this.savePurchases();
      }
      return;
    }

    try {
      await window.google.play.billing.acknowledgePurchase(purchaseToken);
    } catch (error) {
      console.error('Błąd potwierdzania zakupu:', error);
      throw error;
    }
  }

  async restorePurchases() {
    await this.loadPurchases();
    return this.purchases.filter(p => p.purchaseState === 'PURCHASED');
  }

  hasActiveSubscription() {
    const subscriptionPurchases = this.purchases.filter(p => 
      p.productId.startsWith('premium_') && 
      p.purchaseState === 'PURCHASED'
    );

    if (subscriptionPurchases.length === 0) return false;

    // Sprawdź czy subskrypcja jest aktywna
    const latestSubscription = subscriptionPurchases.sort((a, b) => 
      b.purchaseTime - a.purchaseTime
    )[0];

    if (latestSubscription.productId === 'premium_lifetime') {
      return true;
    }

    // Sprawdź datę wygaśnięcia dla subskrypcji czasowych
    const expiryTime = latestSubscription.purchaseTime + 
      (latestSubscription.productId === 'premium_yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000);
    
    return Date.now() < expiryTime;
  }

  getCoinsBalance() {
    const coinPurchases = this.purchases.filter(p => 
      p.productId.startsWith('coins_') && 
      p.purchaseState === 'PURCHASED'
    );

    return coinPurchases.reduce((total, purchase) => {
      const coins = parseInt(purchase.productId.split('_')[1]);
      return total + coins;
    }, 0);
  }

  savePurchases() {
    if (!this.isAvailable) {
      localStorage.setItem('googlePlayPurchases', JSON.stringify(this.purchases));
    }
  }

  // Metody pomocnicze
  getProductById(productId) {
    return this.products.find(p => p.id === productId);
  }

  getAllProducts() {
    return this.products;
  }

  getSubscriptionProducts() {
    return this.products.filter(p => p.type === 'subscription');
  }

  getOneTimeProducts() {
    return this.products.filter(p => p.type === 'oneTime');
  }

  // Sprawdź czy użytkownik ma dostęp do funkcji premium
  hasPremiumAccess() {
    return this.hasActiveSubscription();
  }

  // Sprawdź czy użytkownik ma wystarczającą liczbę monet
  hasEnoughCoins(requiredCoins) {
    return this.getCoinsBalance() >= requiredCoins;
  }

  // Użyj monet (dla talizmanów)
  useCoins(amount) {
    const currentBalance = this.getCoinsBalance();
    if (currentBalance < amount) {
      throw new Error('Niewystarczająca liczba monet');
    }

    // Symuluj użycie monet
    const usageRecord = {
      productId: 'coins_used',
      purchaseToken: 'usage_' + Date.now(),
      purchaseTime: Date.now(),
      purchaseState: 'PURCHASED',
      orderId: 'usage_order_' + Date.now(),
      isAcknowledged: true,
      coinsUsed: amount
    };

    this.purchases.push(usageRecord);
    this.savePurchases();
  }
}

// Eksportuj instancję singleton
const googlePlayBilling = new GooglePlayBilling();
export default googlePlayBilling;
