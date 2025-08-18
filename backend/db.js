const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

console.log('🔍 Inicjalizacja bazy danych...');
console.log('🔍 Ścieżka do bazy:', config.DB_PATH);

const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd otwierania bazy danych:', err);
  } else {
    console.log('✅ Baza danych otwarta pomyślnie');
  }
});

// Tworzenie tabeli użytkowników z dodatkowymi polami bezpieczeństwa
db.serialize(() => {
  // Tabela użytkowników
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firebase_uid TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      reset_token TEXT,
      reset_token_expires DATETIME,
      login_attempts INTEGER DEFAULT 0,
      locked_until DATETIME,
      subscription_status TEXT DEFAULT 'trial',
      subscription_plan TEXT DEFAULT 'free',
      trial_start_date DATETIME,
      trial_end_date DATETIME,
      subscription_start_date DATETIME,
      subscription_end_date DATETIME,
      is_blocked BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Dodaj kolumnę firebase_uid jeśli nie istnieje (dla istniejących baz)
  db.run(`ALTER TABLE users ADD COLUMN firebase_uid TEXT UNIQUE`, (err) => {
    if (err && err.code !== 'SQLITE_ERROR') {
      console.error('❌ Błąd dodawania kolumny firebase_uid:', err);
    } else if (err && err.message.includes('duplicate column name')) {
      console.log('✅ Kolumna firebase_uid już istnieje');
    } else {
      console.log('✅ Kolumna firebase_uid dodana pomyślnie');
    }
  });

  // Tabela płatności
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'PLN',
      payment_method TEXT NOT NULL,
      plan TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Tabela logów bezpieczeństwa
  db.run(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Tabela sesji użytkowników
  db.run(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Tabela talizmanów użytkowników
  db.run(`
    CREATE TABLE IF NOT EXISTS user_talismans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      talisman_id INTEGER NOT NULL,
      owned BOOLEAN DEFAULT 0,
      active BOOLEAN DEFAULT 0,
      obtained_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Tabela serii logowań
  db.run(`
    CREATE TABLE IF NOT EXISTS login_streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      current_streak INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      last_login_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Tabela bonusów talizmanów
  db.run(`
    CREATE TABLE IF NOT EXISTS talisman_bonuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      talisman_id INTEGER NOT NULL,
      bonus_type TEXT NOT NULL,
      bonus_value TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Indeksy dla lepszej wydajności
  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token)');
  db.run('CREATE INDEX IF NOT EXISTS idx_user_talismans_user_id ON user_talismans(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_user_talismans_talisman_id ON user_talismans(talisman_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_login_streaks_user_id ON login_streaks(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_talisman_bonuses_user_id ON talisman_bonuses(user_id)');
});

// Funkcje pomocnicze dla bezpieczeństwa
const logSecurityEvent = (userId, action, ipAddress, userAgent, details) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO security_logs (user_id, action, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?)',
      [userId, action, ipAddress, userAgent, details],
      function(err) {
        if (err) {
          console.error('Błąd logowania bezpieczeństwa:', err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

const incrementLoginAttempts = (email) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET login_attempts = login_attempts + 1 WHERE email = ?',
      [email],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
};

const resetLoginAttempts = (email) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE email = ?',
      [email],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
};

const lockAccount = (email, lockoutTime) => {
  return new Promise((resolve, reject) => {
    const lockedUntil = new Date(Date.now() + lockoutTime).toISOString();
    db.run(
      'UPDATE users SET locked_until = ? WHERE email = ?',
      [lockedUntil, email],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
};

const isAccountLocked = (email) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT locked_until FROM users WHERE email = ?',
      [email],
      (err, row) => {
        if (err) {
          reject(err);
        } else if (!row || !row.locked_until) {
          resolve(false);
        } else {
          const lockedUntil = new Date(row.locked_until);
          const now = new Date();
          resolve(lockedUntil > now);
        }
      }
    );
  });
};

const getLoginAttempts = (email) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT login_attempts FROM users WHERE email = ?',
      [email],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.login_attempts : 0);
        }
      }
    );
  });
};

// Funkcje do obsługi subskrypcji
const initializeTrial = (userId) => {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dni
    
    db.run(
      'UPDATE users SET trial_start_date = ?, trial_end_date = ?, subscription_status = ? WHERE id = ?',
      [now.toISOString(), trialEnd.toISOString(), 'trial', userId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
};

const getUserSubscription = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT subscription_status, subscription_plan, trial_start_date, trial_end_date, subscription_start_date, subscription_end_date, is_blocked FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

const updateSubscription = (userId, plan, status, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET subscription_plan = ?, subscription_status = ?, subscription_start_date = ?, subscription_end_date = ?, is_blocked = 0 WHERE id = ?',
      [plan, status, startDate, endDate, userId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
};

const blockUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET is_blocked = 1 WHERE id = ?',
      [userId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
};

const isUserBlocked = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT is_blocked FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.is_blocked === 1 : false);
        }
      }
    );
  });
};

const addPayment = (userId, amount, paymentMethod, plan, transactionId = null) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO payments (user_id, amount, payment_method, plan, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, amount, paymentMethod, plan, transactionId, 'completed'],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

const getPaymentHistory = (userId) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY payment_date DESC',
      [userId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const checkTrialExpiration = () => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.all(
      'SELECT id, email FROM users WHERE trial_end_date < ? AND subscription_status = "trial" AND is_blocked = 0',
      [now],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

// Funkcja do sprawdzania dostępu użytkownika
const checkUserAccess = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT created_at, subscription_status, subscription_plan, trial_start_date, trial_end_date, subscription_start_date, subscription_end_date FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          reject(err);
        } else if (!user) {
          reject(new Error('Użytkownik nie znaleziony'));
        } else {
          const now = new Date();
          const createdAt = new Date(user.created_at);
          const daysSinceRegistration = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
          
          // Sprawdź czy użytkownik ma aktywną subskrypcję
          const hasActiveSubscription = user.subscription_status === 'active' && 
            user.subscription_end_date && 
            new Date(user.subscription_end_date) > now;
          
          // Sprawdź czy użytkownik ma aktywny okres próbny
          const hasActiveTrial = user.subscription_status === 'trial' && 
            user.trial_end_date && 
            new Date(user.trial_end_date) > now;
          
          // Dostęp jest dozwolony jeśli:
          // 1. Minęło mniej niż 7 dni od rejestracji, LUB
          // 2. Użytkownik ma aktywną subskrypcję, LUB
          // 3. Użytkownik ma aktywny okres próbny
          const hasAccess = daysSinceRegistration <= 7 || hasActiveSubscription || hasActiveTrial;
          
          resolve({
            hasAccess,
            daysSinceRegistration,
            hasActiveSubscription,
            hasActiveTrial,
            subscriptionStatus: user.subscription_status,
            subscriptionPlan: user.subscription_plan,
            trialEndDate: user.trial_end_date,
            subscriptionEndDate: user.subscription_end_date
          });
        }
      }
    );
  });
};

// Funkcja do aktualizacji statusu płatności użytkownika
const updateUserPaymentStatus = (userId, hasPaid = true) => {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dni
    
    db.run(
      'UPDATE users SET subscription_status = ?, subscription_plan = ?, subscription_start_date = ?, subscription_end_date = ?, is_blocked = 0 WHERE id = ?',
      ['active', 'premium', now.toISOString(), endDate.toISOString(), userId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
};

// ===== FUNKCJE DLA SYSTEMU TALIZMANÓW =====

// Funkcja do rejestracji logowania i przyznawania żetonów
const registerLogin = (userId) => {
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().split('T')[0];
    
    db.get(
      'SELECT * FROM login_streaks WHERE user_id = ?',
      [userId],
      (err, streak) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!streak) {
          // Pierwsze logowanie - utwórz nowy rekord
          db.run(
            'INSERT INTO login_streaks (user_id, current_streak, total_tokens, last_login_date) VALUES (?, 1, 1, ?)',
            [userId, today],
            function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({ currentStreak: 1, totalTokens: 1, newToken: true });
              }
            }
          );
        } else {
          const lastLogin = new Date(streak.last_login_date);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate - lastLogin) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // Kolejny dzień z rzędu
            const newStreak = streak.current_streak + 1;
            const newTokens = streak.total_tokens + 1;
            
            db.run(
              'UPDATE login_streaks SET current_streak = ?, total_tokens = ?, last_login_date = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
              [newStreak, newTokens, today, userId],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({ currentStreak: newStreak, totalTokens: newTokens, newToken: true });
                }
              }
            );
          } else if (diffDays === 0) {
            // Już zalogowany dzisiaj
            resolve({ currentStreak: streak.current_streak, totalTokens: streak.total_tokens, newToken: false });
          } else {
            // Przerwa w serii - reset
            db.run(
              'UPDATE login_streaks SET current_streak = 1, total_tokens = ?, last_login_date = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
              [streak.total_tokens + 1, today, userId],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({ currentStreak: 1, totalTokens: streak.total_tokens + 1, newToken: true });
                }
              }
            );
          }
        }
      }
    );
  });
};

// Funkcja do pobierania informacji o serii logowań
const getLoginStreak = (userId) => {
  return new Promise((resolve, reject) => {
    console.log('🔍 getLoginStreak - szukam dla user_id:', userId);
    db.get(
      'SELECT * FROM login_streaks WHERE user_id = ?',
      [userId],
      (err, streak) => {
        if (err) {
          console.error('❌ getLoginStreak - błąd:', err);
          reject(err);
        } else {
          console.log('🔍 getLoginStreak - wynik:', streak);
          resolve(streak || { current_streak: 0, total_tokens: 0, last_login_date: null });
        }
      }
    );
  });
};

// Funkcja do sprawdzania czy użytkownik może otrzymać talizman
const checkTalismanEligibility = (userId) => {
  return new Promise((resolve, reject) => {
    console.log('🔍 checkTalismanEligibility - sprawdzam dla user_id:', userId);
    getLoginStreak(userId)
      .then(streak => {
        console.log('🔍 checkTalismanEligibility - otrzymany streak:', streak);
        const talismanRequirements = [8, 12, 16, 20, 24, 28, 36, 40, 44, 50];
        const availableTalismans = talismanRequirements.filter(req => streak.total_tokens >= req);
        
        const result = {
          currentStreak: streak.current_streak,
          totalTokens: streak.total_tokens,
          availableTalismans,
          nextTalisman: talismanRequirements.find(req => req > streak.total_tokens) || null
        };
        
        console.log('🔍 checkTalismanEligibility - wynik:', result);
        resolve(result);
      })
      .catch(err => {
        console.error('❌ checkTalismanEligibility - błąd:', err);
        reject(err);
      });
  });
};

// Funkcja do przyznawania talizmanu
const grantTalisman = (userId, talismanId) => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    db.run(
      'INSERT OR REPLACE INTO user_talismans (user_id, talisman_id, owned, obtained_date) VALUES (?, ?, 1, ?)',
      [userId, talismanId, now],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

// Funkcja do pobierania talizmanów użytkownika
const getUserTalismans = (userId) => {
  return new Promise((resolve, reject) => {
    console.log('🔍 getUserTalismans - szukam dla user_id:', userId);
    db.all(
      'SELECT * FROM user_talismans WHERE user_id = ?',
      [userId],
      (err, talismans) => {
        if (err) {
          console.error('❌ getUserTalismans - błąd:', err);
          reject(err);
        } else {
          console.log('🔍 getUserTalismans - wynik:', talismans);
          resolve(talismans);
        }
      }
    );
  });
};

// Funkcja do aktywowania/deaktywowania talizmanu
const toggleTalismanActive = (userId, talismanId, active) => {
  return new Promise((resolve, reject) => {
    // Najpierw deaktywuj wszystkie talizmany
    db.run(
      'UPDATE user_talismans SET active = 0 WHERE user_id = ?',
      [userId],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Następnie aktywuj wybrany talizman (jeśli active = true)
        if (active) {
          db.run(
            'UPDATE user_talismans SET active = 1 WHERE user_id = ? AND talisman_id = ?',
            [userId, talismanId],
            function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.changes);
              }
            }
          );
        } else {
          resolve(0);
        }
      }
    );
  });
};

// Funkcja do pobierania aktywnego talizmanu
const getActiveTalisman = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM user_talismans WHERE user_id = ? AND active = 1',
      [userId],
      (err, talisman) => {
        if (err) {
          reject(err);
        } else {
          resolve(talisman);
        }
      }
    );
  });
};

// Funkcja do dodawania bonusu talizmanu
const addTalismanBonus = (userId, talismanId, bonusType, bonusValue, expiresAt) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO talisman_bonuses (user_id, talisman_id, bonus_type, bonus_value, expires_at) VALUES (?, ?, ?, ?, ?)',
      [userId, talismanId, bonusType, bonusValue, expiresAt],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

// Funkcja do pobierania aktywnych bonusów
const getActiveBonuses = (userId) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM talisman_bonuses WHERE user_id = ? AND expires_at > datetime("now")',
      [userId],
      (err, bonuses) => {
        if (err) {
          reject(err);
        } else {
          resolve(bonuses);
        }
      }
    );
  });
};

module.exports = {
  db,
  logSecurityEvent,
  incrementLoginAttempts,
  resetLoginAttempts,
  lockAccount,
  isAccountLocked,
  getLoginAttempts,
  initializeTrial,
  getUserSubscription,
  updateSubscription,
  blockUser,
  isUserBlocked,
  addPayment,
  getPaymentHistory,
  checkTrialExpiration,
  checkUserAccess,
  updateUserPaymentStatus,
  // Funkcje talizmanów
  registerLogin,
  getLoginStreak,
  checkTalismanEligibility,
  grantTalisman,
  getUserTalismans,
  toggleTalismanActive,
  getActiveTalisman,
  addTalismanBonus,
  getActiveBonuses
};

