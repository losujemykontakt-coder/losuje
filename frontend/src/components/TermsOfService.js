import React from 'react';

const TermsOfService = () => {
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
        Regulamin Serwisu
      </h1>

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242' }}>
          1. Postanowienia ogólne
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Niniejszy Regulamin określa zasady korzystania z aplikacji Losuje.pl (dalej "Serwis") 
          świadczonej przez administratora serwisu.
        </p>
        <p style={{ marginBottom: '15px' }}>
          <strong>Administrator serwisu:</strong><br />
          Michał Jedynasty<br />
          Krzywe 16-420 Suwałki<br />
          Email: kontakt@losuje.pl
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          2. Definicje
        </h2>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li><strong>Serwis</strong> - aplikacja Losuje.pl dostępna pod adresem losuje.pl</li>
          <li><strong>Użytkownik</strong> - osoba korzystająca z Serwisu</li>
          <li><strong>Generator</strong> - narzędzie do generowania liczb lotto dostępne w Serwisie</li>
          <li><strong>Konto</strong> - zbiór danych identyfikujących Użytkownika w Serwisie</li>
          <li><strong>Subskrypcja</strong> - płatny dostęp do rozszerzonych funkcji Serwisu</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          3. Zakres usług
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Serwis oferuje następujące usługi:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Generator liczb lotto z zaawansowanymi algorytmami matematycznymi</li>
          <li>Systemy skrócone z matematycznymi gwarancjami trafień</li>
          <li>Generator marzeń - generowanie liczb na podstawie ważnych dat</li>
          <li>Analiza szczęśliwych liczb użytkownika</li>
          <li>Statystyki i wyniki gier liczbowych</li>
          <li>Interaktywny wybór liczb z animowanymi kulami</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          4. Ważne zastrzeżenie - brak gwarancji wygranej
        </h2>
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <p style={{ marginBottom: '15px', fontWeight: '600', color: '#856404' }}>
            ⚠️ WAŻNE: Generator nie gwarantuje wygranej!
          </p>
          <p style={{ marginBottom: '15px', color: '#856404' }}>
            Serwis Losuje.pl to narzędzie pomocnicze wykorzystujące matematyczne algorytmy i symulacje 
            do generowania liczb lotto. Wygenerowane liczby są jedynie sugestiami opartymi na:
          </p>
          <ul style={{ marginBottom: '15px', paddingLeft: '20px', color: '#856404' }}>
            <li>Analizie statystycznej historycznych wyników</li>
            <li>Algorytmach covering design i ILP (Integer Linear Programming)</li>
            <li>Matematycznych symulacjach i prawdopodobieństwach</li>
            <li>Wzorcach kosmicznych i matematycznych</li>
          </ul>
          <p style={{ color: '#856404' }}>
            <strong>Żaden generator nie może gwarantować wygranej w grach losowych.</strong> 
            Lotto pozostaje grą losową, a szanse na wygraną są zawsze ograniczone przez prawa matematyki. 
            Korzystanie z naszego generatora nie zwiększa gwarancji wygranej ponad prawdopodobieństwo matematyczne.
          </p>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          5. Zasady korzystania z Serwisu
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu. Użytkownik zobowiązuje się do:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Korzystania z Serwisu zgodnie z jego przeznaczeniem</li>
          <li>Niepodejmowania działań mogących zakłócić pracę Serwisu</li>
          <li>Nieudostępniania swoich danych logowania osobom trzecim</li>
          <li>Przestrzegania przepisów prawa podczas korzystania z Serwisu</li>
          <li>Niepodejmowania prób nieautoryzowanego dostępu do systemów</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          6. Rejestracja i konto użytkownika
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Aby korzystać z pełnych funkcji Serwisu, Użytkownik musi:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Zarejestrować konto podając prawdziwe dane</li>
          <li>Potwierdzić adres email</li>
          <li>Zachować poufność danych logowania</li>
          <li>Niezwłocznie powiadomić o utracie kontroli nad kontem</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          7. Płatności i subskrypcje
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Serwis oferuje:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Darmowy dostęp do podstawowych funkcji generatora</li>
          <li>Płatną subskrypcję premium z rozszerzonymi funkcjami</li>
          <li>7-dniowy okres próbny za darmo</li>
          <li>Możliwość rezygnacji w każdej chwili</li>
        </ul>
        <p style={{ marginBottom: '15px' }}>
          Płatności są realizowane przez zewnętrznych operatorów (PayPal, Przelewy24) 
          zgodnie z ich regulaminami.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          8. Własność intelektualna
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Wszystkie prawa własności intelektualnej związane z Serwisem należą do administratora. 
          Użytkownik nie może:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Kopiować, modyfikować ani rozpowszechniać kodu źródłowego</li>
          <li>Używać algorytmów w celach komercyjnych bez zgody</li>
          <li>Tworzyć produktów konkurencyjnych na podstawie naszych rozwiązań</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          9. Ograniczenie odpowiedzialności
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Administrator nie ponosi odpowiedzialności za:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Straty finansowe wynikłe z korzystania z generatora</li>
          <li>Brak wygranej w grach lotto</li>
          <li>Działania użytkowników niezgodne z regulaminem</li>
          <li>Awarie techniczne niezależne od administratora</li>
          <li>Utratę danych w wyniku działań użytkownika</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          10. Bezpieczeństwo
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Administrator stosuje odpowiednie środki bezpieczeństwa, ale nie może zagwarantować 
          absolutnej ochrony przed wszystkimi zagrożeniami. Użytkownik powinien:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Używać silnych haseł</li>
          <li>Nie udostępniać danych logowania</li>
          <li>Regularnie zmieniać hasła</li>
          <li>Korzystać z aktualnego oprogramowania antywirusowego</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          11. Zmiany regulaminu
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Administrator zastrzega sobie prawo do zmiany niniejszego Regulaminu. 
          O zmianach użytkownicy będą informowani poprzez:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Powiadomienie w aplikacji</li>
          <li>Email do zarejestrowanych użytkowników</li>
          <li>Informację na stronie głównej</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          12. Rozwiązanie umowy
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Umowa może zostać rozwiązana przez:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Użytkownika - poprzez usunięcie konta</li>
          <li>Administratora - w przypadku naruszenia regulaminu</li>
          <li>Wzajemne porozumienie stron</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          13. Prawo właściwe
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Niniejszy Regulamin podlega prawu polskiemu. Wszelkie spory będą rozstrzygane 
          przez właściwe sądy polskie.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          14. Kontakt
        </h2>
        <p style={{ marginBottom: '15px' }}>
          W sprawach związanych z Serwisem można kontaktować się z nami:
        </p>
        <p style={{ marginBottom: '15px' }}>
          Email: kontakt@losuje.pl<br />
          Adres: Krzywe 16-420 Suwałki
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#424242', marginTop: '30px' }}>
          15. Postanowienia końcowe
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Niniejszy Regulamin wchodzi w życie z dniem publikacji. 
          Korzystanie z Serwisu oznacza akceptację niniejszego regulaminu.
        </p>
        <p style={{ marginBottom: '15px' }}>
          <strong>Ostatnia aktualizacja:</strong> {new Date().toLocaleDateString('pl-PL')}
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;

