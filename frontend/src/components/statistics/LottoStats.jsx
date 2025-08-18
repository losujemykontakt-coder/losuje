import React from 'react';

// Komponent kuli lotto z Tailwind CSS
const LottoBall = ({ number, size = "medium", type = "normal" }) => {
  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    medium: "w-12 h-12 text-lg",
    large: "w-14 h-14 text-xl"
  };

  const typeClasses = {
    normal: "bg-gradient-to-br from-yellow-100 to-yellow-400 border-2 border-yellow-500 text-gray-800",
    hot: "bg-gradient-to-br from-red-100 to-red-500 border-2 border-red-600 text-white",
    cold: "bg-gradient-to-br from-blue-100 to-blue-500 border-2 border-blue-600 text-white",
    notDrawn: "bg-gradient-to-br from-purple-100 to-purple-500 border-2 border-purple-600 text-white"
  };

  return (
    <span className={`
      ${sizeClasses[size]}
      ${typeClasses[type]}
      inline-flex items-center justify-center rounded-full font-bold
      shadow-lg hover:shadow-xl transition-all duration-300
      relative overflow-hidden
    `}>
      {/* Efekt błysku */}
      <div className="absolute top-1 left-2 w-2 h-2 bg-white rounded-full opacity-70"></div>
      <span className="relative z-10">{number}</span>
    </span>
  );
};

const LottoStats = ({ data, gameType, loading, error, lastUpdated, onRefresh }) => {
  const gameNames = {
    lotto: "Lotto (6 z 49)",
    miniLotto: "Mini Lotto (5 z 42)",
    multiMulti: "Multi Multi (10 z 80)",
    eurojackpot: "Eurojackpot (5+2)",
    kaskada: "Kaskada (12 z 24)",
    keno: "Keno (20 z 80)"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Ładowanie statystyk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
        <div className="text-red-600 text-2xl mb-4">❌ Błąd ładowania</div>
        <p className="text-red-500 mb-6">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-12 text-gray-500 text-lg">
        Brak danych dla wybranej gry
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Brak danych';
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL');
  };

  return (
    <div className="space-y-8">
      {/* Nagłówek sekcji */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Statystyki - {gameNames[gameType]}
        </h2>
        <p className="text-gray-600">
          Ostatnia aktualizacja: {formatDate(lastUpdated)}
        </p>
      </div>

      {/* Główne statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ostatnie losowanie */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🎯</span>
            <h3 className="text-lg font-semibold text-gray-800">Ostatnie losowanie</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.lastDraw && data.lastDraw.length > 0 ? (
              data.lastDraw.map((num, index) => (
                <LottoBall key={index} number={num} size="medium" type="normal" />
              ))
            ) : (
              <p className="text-gray-500 text-sm">Brak danych</p>
            )}
          </div>
        </div>

        {/* Liczba losowań */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📈</span>
            <h3 className="text-lg font-semibold text-gray-800">Liczba losowań</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.totalDraws || 0}</p>
        </div>

        {/* Średnia suma */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📊</span>
            <h3 className="text-lg font-semibold text-gray-800">Średnia suma</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{data.avgSum || 0}</p>
        </div>

        {/* Zakres sumy */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📏</span>
            <h3 className="text-lg font-semibold text-gray-800">Zakres sumy</h3>
          </div>
          <p className="text-xl font-semibold text-purple-600">
            {data.sumRange ? `${data.sumRange[0]} - ${data.sumRange[1]}` : 'Brak danych'}
          </p>
        </div>
      </div>

      {/* Najczęściej losowane liczby */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">🔥</span>
          <h3 className="text-xl font-bold text-gray-800">Najczęściej losowane liczby (TOP 10)</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {data.hotNumbers && data.hotNumbers.length > 0 ? (
            data.hotNumbers.map((num, index) => (
              <LottoBall key={index} number={num} size="medium" type="hot" />
            ))
          ) : (
            <p className="text-gray-500">Brak danych</p>
          )}
        </div>
      </div>

      {/* Najrzadziej losowane liczby */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">❄️</span>
          <h3 className="text-xl font-bold text-gray-800">Najrzadziej losowane liczby</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {data.coldNumbers && data.coldNumbers.length > 0 ? (
            data.coldNumbers.map((num, index) => (
              <LottoBall key={index} number={num} size="medium" type="cold" />
            ))
          ) : (
            <p className="text-gray-500">Brak danych</p>
          )}
        </div>
      </div>

      {/* Najdłużej niewylosowane liczby */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">⏰</span>
          <h3 className="text-xl font-bold text-gray-800">Najdłużej niewylosowane liczby</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {data.notDrawnNumbers && data.notDrawnNumbers.length > 0 ? (
            data.notDrawnNumbers.map((num, index) => (
              <LottoBall key={index} number={num} size="medium" type="notDrawn" />
            ))
          ) : (
            <p className="text-gray-500">Brak danych</p>
          )}
        </div>
      </div>

      {/* Przycisk odświeżania */}
      <div className="text-center">
        <button
          onClick={onRefresh}
          className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold shadow-lg"
        >
          🔄 Odśwież dane
        </button>
      </div>
    </div>
  );
};

export default LottoStats; 