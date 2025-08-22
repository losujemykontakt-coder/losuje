// Funkcje autoryzacji
export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error("Błąd połączenia z serwerem");
  }
};

export const registerUser = async (email, password, name) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error("Błąd połączenia z serwerem");
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  return true;
};

export const getStoredToken = () => {
  return localStorage.getItem('token') || "";
};

export const setStoredToken = (token) => {
  localStorage.setItem('token', token);
};

export const isAuthenticated = (token) => {
  return !!token;
};

// Funkcja do sprawdzania dostępu użytkownika
export const checkUserAccess = async () => {
  const token = getStoredToken();
  if (!token) {
    return { hasAccess: false, error: 'UNAUTHORIZED' };
  }

  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://losuje.pl'}/api/stats/lotto`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (res.status === 403) {
      const errorData = await res.json();
      return { 
        hasAccess: false, 
        error: 'ACCESS_DENIED',
        message: errorData.message,
        details: errorData.details
      };
    }
    
    if (res.status === 401) {
      return { hasAccess: false, error: 'UNAUTHORIZED' };
    }
    
    return { hasAccess: true };
  } catch (err) {
    console.error('Błąd sprawdzania dostępu:', err);
    return { hasAccess: false, error: 'NETWORK_ERROR' };
  }
};

// Funkcja do obsługi błędów dostępu
export const handleAccessError = (error, navigate) => {
  if (error === 'ACCESS_DENIED') {
    // Przekieruj na stronę płatności
    navigate('/?page=payments');
    return true;
  } else if (error === 'UNAUTHORIZED') {
    // Przekieruj na stronę logowania
    navigate('/?page=login');
    return true;
  }
  return false;
}; 