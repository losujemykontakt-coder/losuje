// Ikony metod płatności w formacie SVG - oryginalne kolory firmowe

export const BLIKIcon = () => (
  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="24" rx="3" fill="#000000"/>
    <text x="20" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">BLIK</text>
  </svg>
);

export const PayPalIcon = () => (
  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="24" rx="3" fill="#0070BA"/>
    <text x="20" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">PayPal</text>
  </svg>
);

export const Przelewy24Icon = () => (
  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="24" rx="3" fill="#FF6B00"/>
    <text x="20" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">Przelewy24</text>
  </svg>
);

export const CardIcon = () => (
  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{stopColor: '#1a1a1a', stopOpacity: 1}} />
        <stop offset="50%" style={{stopColor: '#4a4a4a', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: '#1a1a1a', stopOpacity: 1}} />
      </linearGradient>
    </defs>
    <rect width="40" height="24" rx="3" fill="url(#cardGradient)"/>
    <rect x="8" y="8" width="24" height="8" rx="1" fill="white" opacity="0.9"/>
    <rect x="8" y="18" width="12" height="2" rx="1" fill="white" opacity="0.7"/>
  </svg>
);

export const TransferIcon = () => (
  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="24" rx="3" fill="#2E7D32"/>
    <path d="M12 8l4 4h-3v4h-2v-4H8l4-4zm8 8l-4-4h3V8h2v4h3l-4 4z" fill="white"/>
  </svg>
); 