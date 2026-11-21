# La Rambla Cleaner

Dodatek do Chrome i Firefoksa, który ułatwia czytanie komentarzy na FCBarca.com i w sekcji La Rambla.

## Ukrywanie ignorowanych użytkowników

Dodatek usuwa z widoku komentarze użytkowników ignorowanych na stronie, a także ich wpisy w sekcji „Gorące dyskusje”. Korzysta z informacji o ignorowaniu dostępnych na FCBarca.com.

Opcja **Ukryj mention ignorowanych** pozwala dodatkowo ukrywać komentarze innych osób, jeśli zawierają wzmiankę o ignorowanym użytkowniku. Ta opcja jest domyślnie wyłączona.

## Kategorie komentarzy

Dodatek przypisuje komentarzom kategorię na podstawie słów występujących w ich treści. Obok komentarza pojawia się etykieta, np. polityka, transfery, football, plotki, inny sport, gry, technologia, film lub muzyka. Komentarze bez dopasowania otrzymują kategorię „inny”. Klasyfikacja jest automatyczna i może się pomylić.

W okienku dodatku można włączyć lub wyłączyć wyświetlanie kategorii oraz zaznaczyć tematy, których komentarze mają być ukrywane. Zaznaczenie kategorii oznacza jej ukrycie.

## Tłumacz Borneo

Funkcja **Borneo Tłumacz** pomaga odczytać komentarze użytkownika Borneo. Po kliknięciu przycisku **Przetłumacz**, znajdującego się u góry komentarza obok kategorii, dodatek poprawia polską pisownię, gramatykę i interpunkcję. Nie tłumaczy komentarza na inny język; stara się zachować sens i ton wypowiedzi.

Poprawiona wersja zastępuje oryginalny tekst. Wzmianki **@użytkownik** oraz adresy stron pozostają klikalne. Funkcja obejmuje również odpowiedzi i komentarze doładowane podczas przeglądania strony.

Tekst jest przetwarzany przez usługę AI dopiero po kliknięciu przycisku. Wcześniej poprawione komentarze są zapamiętywane we wspólnej bazie, dzięki czemu kolejne osoby mogą zobaczyć gotową wersję bez ponownego przetwarzania tego samego komentarza.

Funkcja jest domyślnie włączona. Aby ją wyłączyć, odznacz **Borneo Tłumacz** w okienku dodatku. Przycisk zniknie, a poprawione komentarze wrócą do oryginalnej postaci. Poprawiona wersja może zawierać błędy, szczególnie gdy pierwotny komentarz jest niejednoznaczny.

## Ustawienia

Opcja **Ukryj komentarze z postami z X** ukrywa całe komentarze zawierające osadzone posty z X (Twittera). Jest domyślnie wyłączona. Zmiana działa bez odświeżania strony, również dla doładowanych wpisów. Odznaczenie opcji przywraca komentarze, o ile nie ukrywają ich pozostałe filtry.

Kliknij ikonę La Rambla Cleaner na pasku przeglądarki, aby otworzyć okienko ustawień. Wybrane opcje są zapamiętywane przez przeglądarkę.

## Obsługiwane przeglądarki

Dodatek jest dostępny dla Chrome oraz Firefoksa. Wersja dla Firefoksa wymaga co najmniej Firefoksa 140 na komputerze lub Firefoksa 142 na Androidzie.

### Kategorie i wygląd nagłówków
Słowniki wszystkich kategorii obejmują dodatkowe nazwy i frazy; polityka uwzględnia m.in. partie, polityków, sądy, praworządność, gospodarkę i sprawy międzynarodowe. Dopasowanie pomija nicki i adresy URL, obsługuje polskie znaki oraz frazy wielowyrazowe. Nadal jest to heurystyka wymagająca co najmniej dwóch dopasowań i może się mylić.

Etykiety kategorii i przyciski „Przetłumacz” / „Przetłumaczono” mają kompaktowy wygląd w linii nagłówka. Style znajdują się w `src/content.css`. Ikony herbu w rozmiarach 16, 32, 48 i 128 px są dołączane do obu wersji dodatku; źródło obrazu opisano w `icons/SOURCE.txt`.

## Wydania Chrome 2.4.4 / Firefox 2.4.5

W porównaniu z Chrome 2.4.2 / Firefox 2.4.3 dodano ukrywanie całych komentarzy z postami z X, rozszerzono słowniki kategorii (szczególnie polityki) i obsługę fraz wielowyrazowych, wyłączono dopasowywanie nicków i URL-i, zmniejszono oraz wyrównano etykiety i przyciski tłumacza, poprawiono polskie znaki i dodano ikonę herbu Barcelony. Usunięto też zbędne przepisywanie niezmienionych etykiet.

Gałęzie `chrome-store` i `firefox-store` zachowują osobne domyślne pliki `manifest.json` i wersje pakietu. Gotowy polski wpis z opisem zmian i linkami do porównań znajduje się w [docs/post-na-la-ramble.txt](docs/post-na-la-ramble.txt).
