# Mapa

## Jak się poruszać
- **Górny pasek**: logo i stan połączenia, liczniki (aktywne węzły, repeatery, obserwatorzy, łącza, pakiety na minutę), wyszukiwarka, wybór obszaru i okresu łączy, menu **Warstwy**, **Zasięg radiowy**, **Narzędzia**, przełącznik motywu ☀️/🌙 i konto.
- **Szyna sekcji po lewej**: **Sieć**, **Wiadomości**, **Zasięg**, **Zarządzaj**, **Ustawienia**. Kliknięcie otwiera panel sekcji, ponowne kliknięcie tej samej sekcji chowa panel (mapa na cały ekran). Pod-zakładki są na górze panelu.
- **Ekran „Co chcesz zrobić?”**: duże kafelki z najczęstszymi zadaniami. Pełny pulpit sieci jest rozwijany pod nimi.
- **Tryb wyświetlania** (na dole ekranu startowego albo w Ustawieniach): **Prosty** pokazuje to, co najważniejsze, **Operator** dodaje zaawansowany zasięg i narzędzia terenowe, **Ekspert** pokazuje wszystko. Uprawnienia się nie zmieniają, tylko ilość pokazanych rzeczy.
- **Jedna wyszukiwarka**: pole w pasku znajduje miejsce, węzeł, szczyt, współrzędne, a także **funkcję lub ustawienie**. **⚙️🔎** albo **Ctrl+K** otwiera wyszukiwanie funkcji; gwiazdka ☆ przy wyniku dodaje go do **⭐ Moich skrótów** na ekranie startowym.
- **Przycisk ＋** na mapie: kliknij ＋, a potem punkt na mapie: zasięg z tego miejsca, profil terenu, udostępnienie punktu (bez prawego kliknięcia, wygodne na telefonie).
- **„?”** na dole szyny: pomoc do bieżącego ekranu (te strony).
- **✕ Wyczyść mapę** (w pasku, gdy coś jest narysowane): usuwa zasięg, profil terenu i pomiary.

## Węzły
- **Repeatery**: złote kółko z białą obwódką. Jasne złoto: aktywny (ostatnie 10 min), ciemniejsze: słyszany niedawno, szare: nieaktywny.
- **Room servery**: żółty kwadrat. **Companiony**: kółko z obwódką. **Czujniki**: trójkąt. **Obserwatorzy**: przerywany pierścień wokół węzła.
- Nazwy węzłów pojawiają się od zbliżenia na poziomie miasta; emotki z nazw na mapie są pomijane.
- **Legenda i filtry** (prawy dolny róg, domyślnie zwinięta): pokazywanie i ukrywanie typów węzłów, rodzajów łączy i nieaktywnych.
- Kliknięcie węzła otwiera **kartę** (informacje, sąsiedzi, pakiety, czujniki, administracja). Prawy klik (na telefonie długie przytrzymanie): ulubione, „Moje węzły”, wiadomość, zasięg z węzła, ścieżka od companiona, usunięcie węzła (administrator).

## Łącza
- **Zmierzone**: SNR odebrany przez obserwatorów, ślady (trace) i odkrywanie sąsiadów. Kolor według SNR, okres do wyboru (*Łącza 24 h*).
- **Ścieżki**: łącza odczytane ze ścieżek pakietów. Domyślnie tylko ze ścieżek 2-bajtowych (u nas obowiązkowych), żeby uniknąć pomyłek przy powtarzających się prefiksach.
- **Sąsiedzi**: zadeklarowani przez repeatery.

## Pakiety na żywo
- **Pasek „NA ŻYWO”** na dole mapy: każdy nowy pakiet z godziną, typem, nadawcą, kanałem, liczbą skoków i SNR. Kliknięcie otwiera pełny analizator (**Sieć › MeshCore › Pakiety**).
- **Animacje na mapie** (*Warstwy › Animacje*): pakiet leci jak kometa od nadawcy przez rozpoznane repeatery do obserwatora, użyte łącza się podświetlają, a na końcu rozchodzi się fala. Gdy pośredni repeater nie jest rozpoznany, trasa jest rysowana kropkami. Animację widać tylko dla pakietów, które usłyszał obserwator z pozycją na mapie.
- **Aktywność (ostatnie 10 min)** w legendzie: poświata wokół węzłów, które właśnie nadawały.
- **Odtwórz** (w pasku): powtórka ostatnich 24 godzin.

## Warstwy
*Warstwy ▾*: podkład mapy (jasny, ciemny, topograficzny), punkty orientacyjne, nieaktywne, animacje, punkty wysokie, **Repeatery SF8** (sieć MeshCore Polska, fioletowe kółka), **Pomiary w terenie** (kratki z Mappera SF6: kolor = najlepszy SNR, szare = brak odpowiedzi), sąsiednie mapy.

## Alerty i stan
- **Alerty**: cichy węzeł, słaba bateria, ostrzeżenia firmware, różny rozmiar hasha.
- **Stan mapy** (Sieć): procesor, pamięć, dysk, baza, MQTT.
- **Raport tygodniowy** (*Narzędzia*), historia ponad rok.

## Ulubione i „Moje węzły”
Na karcie węzła (po zalogowaniu): **☆ Ulubiony** przenosi węzeł na górę list, **🛠 Administruję** dodaje go do grupy **Moje węzły**. Repeatery z zapamiętanym hasłem trafiają tam same. Alert „cichy węzeł” można włączyć z powiadomieniem po 1–24 h ciszy.

## Mapa publiczna
*Narzędzia › Udostępnij*: strona `/publique` bez wiadomości i bez dokładnych pozycji prywatnych osób, do pokazania sieci. Tryb demonstracyjny pełnej mapy bez logowania: `/?consultation` (tylko kanały publiczne, nic nie jest zapisywane ani wysyłane).

## Telefon i tablet
Panel jest szufladą (trzy wysokości), karta węzła też. **◎ Moja pozycja** wymaga HTTPS. Długie przytrzymanie na mapie: zasięg z punktu, profil, udostępnienie. Mapę można zainstalować jak aplikację (*Narzędzia › Zainstaluj*).
