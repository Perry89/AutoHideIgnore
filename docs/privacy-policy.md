# La Rambla Cleaner / La Rambla Tools — Privacy policy

Updated: 21 November 2026. Contact: info@bluehashstudio.com

## English

The extension customises the display of comments on FCBarca.com. Ignored-user
filtering, mentions, topic classification and X/Twitter filtering run locally.
Settings, ignored-user identifiers discovered by the extension, and cached
category dictionaries are stored in the browser's extension storage.

Category keywords are downloaded from a public, read-only document in Google
Firebase Firestore, normally at most once every 24 hours per browser profile.
This request does not include comments or browsing history. As with ordinary
network requests, the service provider receives connection information such as
the IP address. No analytics or advertising trackers are added by the extension.

Borneo proofreading is optional. Only when you click “Przetłumacz”, the extension
sends that public comment's text and comment identifier to the developer's
Firebase service. Firebase anonymous authentication supplies an anonymous user
identifier used for request limits; no account registration is required by the
extension. The server may send the comment text to Google's Gemini API to correct
Polish spelling, grammar and punctuation. Text can include names, mentions and
links already present in the comment. Do not use this function for private text.

The original comment, its correction, author label, comment identifier and
processing timestamps are kept in the server-side shared correction cache so
other users can reuse a correction. Anonymous usage counters are also stored to
limit requests. No automatic deletion period is currently implemented. Contact
the developer about deletion requests, identifying the relevant comment.
Disabling proofreading stops new requests from that feature; removing the
extension clears its browser-local data but does not delete existing server data.

Google Firebase/Google Cloud and Gemini process the requests needed for these
features under their applicable service policies. Data is used to provide and
protect these features, not sold or used by the developer for advertising,
creditworthiness or unrelated profiling. The extension does not delete or change
comments on FCBarca.com for other users.

## Polski

Dodatek porządkuje widok komentarzy na FCBarca.com. Ignorowanie użytkowników,
filtrowanie wzmianek, rozpoznawanie tematów i ukrywanie wpisów z X/Twittera
odbywa się lokalnie. Ustawienia, rozpoznane identyfikatory ignorowanych
użytkowników oraz słowniki kategorii są zapisywane w pamięci dodatku.

Słowniki są pobierane z publicznego dokumentu Firebase Firestore, zwykle najwyżej
raz na 24 godziny w danym profilu przeglądarki. Żądanie nie zawiera komentarzy ani
historii przeglądania. Dostawca usługi otrzymuje dane połączenia, np. adres IP.
Dodatek nie dodaje analityki ani mechanizmów śledzenia reklamowego.

Korekta Borneo jest opcjonalna. Dopiero po kliknięciu „Przetłumacz” tekst
publicznego komentarza i jego identyfikator są wysyłane do usługi Firebase
autora dodatku. Logowanie anonimowe Firebase zapewnia anonimowy identyfikator do
limitowania żądań; dodatek nie wymaga zakładania konta. Serwer może przekazać
tekst do API Google Gemini w celu korekty polskiej pisowni, gramatyki i
interpunkcji. Tekst może zawierać nazwy, wzmianki i linki obecne w komentarzu.
Nie używaj tej funkcji do tekstów prywatnych.

Oryginał, korekta, oznaczenie autora, identyfikator komentarza i czas przetwarzania
są przechowywane we wspólnej pamięci korekt na serwerze. Przechowywane są również
anonimowe liczniki użycia. Nie wdrożono automatycznego terminu usuwania tych
danych. W sprawie usunięcia skontaktuj się z autorem, wskazując komentarz.
Wyłączenie korekty zatrzymuje nowe żądania tej funkcji. Usunięcie dodatku usuwa
lokalne dane przeglądarki, lecz nie usuwa wcześniej zapisanych danych serwera.

Google Firebase/Google Cloud i Gemini obsługują żądania na zasadach swoich usług.
Autor wykorzystuje dane do świadczenia i ochrony opisanych funkcji, nie sprzedaje
ich ani nie używa do reklam, oceny zdolności kredytowej lub niezwiązanego
profilowania. Dodatek nie usuwa ani nie zmienia komentarzy dla innych osób.
