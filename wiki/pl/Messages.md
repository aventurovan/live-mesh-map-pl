# Wiadomości

Czytanie wymaga zalogowania (członek), wysyłanie wymaga **companiona podłączonego do mapy** i uprawnień administratora.

## Wysyłanie
- wybierz **kanał** albo **✉️ Wiadomość bezpośrednia** (szukaj po nazwie);
- kliknięcie odebranej wiadomości przygotowuje odpowiedź na właściwym kanale;
- kliknięcie **nazwy autora**: karta węzła, wiadomość bezpośrednia, pokaż na mapie;
- **⚡ Szybkie wiadomości**: gotowe teksty jednym kliknięciem, lista do edycji;
- **@wzmianka**: wpisz `@` i początek nazwy;
- **szkic** jest zapamiętywany dla każdego kanału;
- **współrzędne** w wiadomościach są klikalne i centrują mapę.

## Czy wiadomość doszła
Pod wiadomością wysłaną z mapy widać potwierdzenia (✓✓ dla wiadomości bezpośredniej) oraz **📡 Usłyszana przez N odbiorników**: obserwator, liczba skoków, SNR, ostatni repeater. Kliknięcie pokazuje trasę na mapie. Przy wiadomości przekazanej przez repeatery po liczbie skoków jest rozmiar hasha ścieżki („2 skoki · 2 B”).

Wiadomość na kanale nie ma potwierdzenia przeczytania. Żeby sprawdzić, czy konkretna osoba Cię słyszy, wyślij jej **wiadomość bezpośrednią**.

## Nieprzeczytane, dźwięki i powiadomienia
- licznik na sekcji **Wiadomości**; pasek kanałów z liczbą nowych wiadomości, kanał z nowościami przesuwa się na początek;
- nowe wiadomości są wyróżnione przez 3 minuty;
- **🔔 Dźwięki**: zaznacz kanały, które mają dzwonić;
- wiadomość bezpośrednia do companiona mapy: sygnał, okienko i powiadomienie systemowe.

## Region wiadomości
Wiadomość wysłana floodem może mieć **region**. Repeater przekazuje ją tylko, jeśli ten region ma w swoim drzewie. W naszej sieci repeatery na razie działają bez regionów. Etykieta przy wiadomości: **🏷 region**, **bez regionu** albo **🏷 region?** (nieznany: dopisz go do `MESHCORE_REGIONS` w `.env`).

## Udostępniona pozycja
Wiadomość z `geo:50.04312,19.88512` albo `📍 50.04312,19.88512` staje się **📍 pinezką** na mapie. Własną pozycję wyślesz przyciskiem **📍 Dołącz środek mapy** albo prawym klikiem na mapie › **Udostępnij ten punkt**.
