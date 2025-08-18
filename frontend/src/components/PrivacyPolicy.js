import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      lineHeight: '1.6',
      color: '#333'
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        Polityka Prywatności
      </h1>

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242' }}>
          1. Informacje ogólne
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Niniejsza Polityka Prywatności określa zasady przetwarzania danych osobowych w aplikacji Losuje.pl 
          (dalej "Aplikacja") przez administratora danych osobowych.
        </p>
        <p style={{ marginBottom: '15px' }}>
          <strong>Administrator danych osobowych:</strong><br />
          Michał Jedynasty<br />
          Krzywe 16-420 Suwałki<br />
          Email: kontakt@losuje.pl
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          2. Zakres zbieranych danych
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Aplikacja zbiera następujące kategorie danych osobowych:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Dane identyfikacyjne: imię, nazwisko, adres email</li>
          <li>Dane techniczne: adres IP, informacje o urządzeniu i przeglądarce</li>
          <li>Dane użytkowania: preferencje gier, wygenerowane zestawy liczb, historię aktywności</li>
          <li>Dane płatności: informacje o subskrypcjach i płatnościach (przetwarzane przez zewnętrznych operatorów płatności)</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          3. Cel przetwarzania danych
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Dane osobowe są przetwarzane w następujących celach:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Świadczenie usług generatora liczb lotto</li>
          <li>Personalizacja doświadczeń użytkownika</li>
          <li>Obsługa płatności i subskrypcji</li>
          <li>Komunikacja z użytkownikami</li>
          <li>Analiza i poprawa funkcjonalności aplikacji</li>
          <li>Zapewnienie bezpieczeństwa i zapobieganie nadużyciom</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          4. Podstawa prawna przetwarzania
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Przetwarzanie danych odbywa się na podstawie:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Art. 6 ust. 1 lit. b) RODO - wykonanie umowy</li>
          <li>Art. 6 ust. 1 lit. f) RODO - uzasadniony interes administratora</li>
          <li>Art. 6 ust. 1 lit. a) RODO - zgoda użytkownika (w określonych przypadkach)</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          5. Okres przechowywania danych
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Dane osobowe są przechowywane przez okres:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Dane konta użytkownika: do momentu usunięcia konta</li>
          <li>Dane płatności: zgodnie z wymogami prawnymi (do 5 lat)</li>
          <li>Logi techniczne: do 12 miesięcy</li>
          <li>Dane marketingowe: do momentu wycofania zgody</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          6. Udostępnianie danych
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Dane mogą być udostępniane:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Operatorom płatności (PayPal, Przelewy24) w celu realizacji płatności</li>
          <li>Dostawcom usług hostingowych i technicznych</li>
          <li>Organom państwowym na podstawie przepisów prawa</li>
          <li>Innym podmiotom wyłącznie za wyraźną zgodą użytkownika</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          7. Prawa użytkownika
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Użytkownik ma prawo do:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Dostępu do swoich danych osobowych</li>
          <li>Sprostowania nieprawidłowych danych</li>
          <li>Usunięcia danych ("prawo do bycia zapomnianym")</li>
          <li>Ograniczenia przetwarzania</li>
          <li>Przenoszenia danych</li>
          <li>Wniesienia sprzeciwu</li>
          <li>Wycofania zgody w dowolnym momencie</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          8. Bezpieczeństwo danych
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Stosujemy odpowiednie środki techniczne i organizacyjne, aby chronić dane osobowe przed:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Nieuprawnionym dostępem</li>
          <li>Utratą, zniszczeniem lub uszkodzeniem</li>
          <li>Nieuprawnionym ujawnieniem</li>
          <li>Nieuprawnioną modyfikacją</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          9. Pliki cookies
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Aplikacja używa plików cookies w celu:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Zapewnienia prawidłowego funkcjonowania aplikacji</li>
          <li>Zapamiętywania preferencji użytkownika</li>
          <li>Analizy ruchu i poprawy wydajności</li>
          <li>Personalizacji treści</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          10. Kontakt
        </h2>
        <p style={{ marginBottom: '15px' }}>
          W sprawach związanych z ochroną danych osobowych można kontaktować się z nami:
        </p>
        <p style={{ marginBottom: '15px' }}>
          Email: kontakt@losuje.pl<br />
          Adres: Krzywe 16-420 Suwałki
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          11. Zmiany w polityce prywatności
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. 
          O wszelkich zmianach będziemy informować użytkowników poprzez aplikację lub email.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          12. Postanowienia końcowe
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Niniejsza Polityka Prywatności wchodzi w życie z dniem publikacji. 
          Korzystanie z aplikacji oznacza akceptację niniejszej polityki.
        </p>
        <p style={{ marginBottom: '15px' }}>
          <strong>Ostatnia aktualizacja:</strong> {new Date().toLocaleDateString('pl-PL')}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

