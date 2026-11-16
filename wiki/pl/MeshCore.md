# MeshCore

Mapa pokazuje sieć MeshCore: repeatery, room servery, companiony, czujniki, obserwatorów, łącza zmierzone i odgadnięte oraz analizator pakietów na żywo.

## Skąd mapa ma dane
- **Obserwatorzy przez MQTT**: companiony z programem packet capture publikują pakiety do brokera (`meshcore/<IATA>/<klucz>/packets`). U nas: lokalny broker na serwerze, obszar **KTW**, sąsiedni **KRK**. Szczegóły: [[Źródła danych|Brancher-le-réseau]].
- **Companion mapy** (opcjonalnie): companion podłączony bezpośrednio do mapy (Wi-Fi, USB na serwerze, Bluetooth w przeglądarce, agent). Działa jak obserwator i dodatkowo pozwala **wysyłać wiadomości i administrować repeaterami**. Companion obsługuje tylko jednego klienta naraz.

## Narzędzia companiona (zakładka MeshCore › Companion, administrator)
- **📡 Kto mnie słyszy bezpośrednio?**: wywołanie 0-skokowe; każdy repeater w zasięgu odpowiada. Tabela z SNR w obie strony i odległością. Bez hasła, automatycznie co 6 h.
- **📊 Szum i statystyki**: poziom szumu, SNR, RSSI, czas nadawania i odbioru, krzywa szumu z 7 dni. Powyżej −100 dBm coś w pobliżu zakłóca odbiór.
- **🌡️ Telemetria**: bateria i czujniki.
- **Region domyślny** wysyłanych wiadomości.

## Repeatery (Zarządzaj › MeshCore › Programuj i karta repeatera)
- logowanie **hasłem admina** (można zapamiętać);
- odczyt i zmiana ustawień, stan (bateria, szum, nadawanie), sąsiedzi, zegar, advert, restart, **konsola CLI** (strzałki ↑ ↓ przywołują poprzednie komendy; komendy z hasłem nie są zapamiętywane);
- **Trace**: przejście tam i z powrotem ścieżką z **SNR każdego skoku**, bez hasła; co noc ok. 3:00 dla monitorowanych repeaterów;
- **odczyt wybranych ustawień** zamiast wszystkiego;
- **🔑 Hasła**: zmiana hasła admina i gościa;
- **🗺️ Regiony**: drzewo regionów, region domowy i region wysyłania (`region put`, `allowf`/`denyf`, `home`, `default`, `remove`, zapis);
- **📋 Szablony**: te same ustawienia dla wielu repeaterów naraz (nazwa, pozycja, kontakt i hasło nigdy nie są w szablonie). Dostępny jest szablon **„Repeater podstawowy (Południe SF6)”**:

| Ustawienie | Wartość |
|---|---|
| radio | 869.618, 62.5, 6, 8 |
| tx | 22 dBm |
| path.hash.mode | 1 (2 bajty) |
| advert.interval | 60 min |
| flood.advert.interval | 12 h |
| flood.max | 32 |
| regiony | bez regionów |

- **🚀 Uruchomienie** (karta repeatera): szablon, nazwa, pozycja (z mapy), kontakt (`owner.info`) i nowe hasło admina w jednej operacji;
- **Ponawiaj przez 2 h**: repeatery z chwilowym błędem są ponawiane co 10 min przez 2 godziny;
- **sprawdzenie zgodności** z wzorcem i automatyczne **monitorowanie** z alertami (cisza, bateria, nadawanie, zakłócenia).

## Ścieżka od companiona
Dla każdego kontaktu companion pamięta **ścieżkę** (listę repeaterów) z ostatniej wymiany. Jeśli jest błędna, wiadomości bezpośrednie nie dochodzą, choć węzeł jest osiągalny. Karta węzła i prawy klik **🧭 Ścieżka od companiona**: **↺ Resetuj** (następna wiadomość pójdzie floodem i ścieżka nauczy się od nowa), **Wymuś bezpośrednio** (0 skoków), **Wymuś ścieżkę** (identyfikatory repeaterów, np. `A3F1,7F02` przy 2 bajtach).

## Audyt regionów i kolizje identyfikatorów (Programuj)
- **🏷 Audyt regionów**: porównuje regiony zadeklarowane przez repeater z tymi, które faktycznie przekazuje.
- **🔀 Kolizje ID**: w ścieżce każdy repeater to tylko początek klucza. Dwa bliskie repeatery z tym samym początkiem dają niejednoznaczną trasę. Rozwiązanie w naszej sieci jest obowiązkowe: `set path.hash.mode 1` (2 bajty).
- **Rozmiar hasha każdego repeatera**: mapa wskazuje repeatery, które w swoich advertach używają innego rozmiaru niż reszta sieci, i podaje komendę do poprawki.

## Czujniki: odczyty i wykresy (karta węzła › Czujniki)
- **Odczyt co…**: od 15 min do 24 h; mapa sama uruchamia telemetrię przez companiona (wymaga hasła gościa lub admina albo otwartej telemetrii);
- wykres dla każdej wielkości (napięcie, temperatura, wilgotność, prąd…) z 1, 7, 30 lub 90 dni;
- własne nazwy pomiarów, **🔔 alerty** progowe, ukrywanie nieistotnych wejść, eksport **CSV**.

## Kanały do odszyfrowania
Jeden na linię: `Public` (kanał publiczny), `#nazwa` (kanał hashtagowy: wystarczy dokładna nazwa), `Nazwa=sekret` (kanał prywatny, 32 znaki hex). Kanały z podłączonego companiona są odszyfrowywane automatycznie.

## Alerty serwisowe MeshCore
Mapa sama wskazuje: znane problemy firmware lub sprzętu, room server w trybie repeat (od 1.18 niezalecane), nowe wydanie MeshCore przy repeaterach na starszej wersji, repeater z innym rozmiarem hasha.

Firmware z ustawieniami naszej sieci: [Flasher SF6](https://meshcoresouth.pl/flasher.php).
