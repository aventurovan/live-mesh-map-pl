# Zasięg i miejsca na repeatery

Sekcja **Zasięg** i menu **Zasięg radiowy** w pasku. Obliczenia korzystają z modelu terenu **Copernicus DEM GLO-30** (ESA, bezpłatny) w kwadratach 1° × 1° (np. `MN49E019` = 49–50°N, 19–20°E), z ustawieniami radia **SF6** (869,618 MHz · 62,5 kHz · SF6 · CR8), domyślnie 22 dBm i antena 5 dBi, bez strat w kablu.

## Narzędzia
- **Obecny zasięg sieci**: obszar obsługiwany przez wykryte repeatery i to, co pokrywa każdy z nich osobno.
- **Zasięg z punktu**: kliknij miejsce na mapie albo węzeł; wysokość anteny do ustawienia.
- **Pokryj punkt (lub kilka)**: miejsca, z których jeden repeater obsłuży wskazane lokalizacje.
- **Połącz dwa miejsca**: czy potrzebne są repeatery pośrednie i gdzie je postawić.
- **Plan pokrycia obszaru**: cel w %, liczba miejsc, przycisk **pokaż zasięg** przy każdej propozycji.
- **Plan z budżetem**: „mam N repeaterów do postawienia” i ile obszaru to da.
- **Symulacja „co jeśli…”**: wyłącz lub dodaj repeatery i zobacz, co przestaje być pokryte.
- **Profil terenu między dwoma punktami**: wysokość anteny nad ziemią na każdym końcu, linia widoczności, strefa Fresnela, bilans łącza (moc, zysk anteny), przewidywany SNR i zapas. Wysokości poza Francją pochodzą z modelu Copernicus (Open-Meteo).
- **Karta instalacji** repeatera (wysokość anteny, zysk, moc, zasilanie): używana w obliczeniach.
- **Zasięg zmierzony**: skąd naprawdę odbierane są węzły. Dodatkowo warstwa **Pomiary w terenie** pokazuje pomiary z [Mappera SF6](https://meshcoresouth.pl/mapper).

## Obszar rysowany ręcznie
*Zasięg › Plan* › **🖊 Narysuj obszar**: badanie wybranego fragmentu (dolina, pasmo górskie, trasa) zamiast całości.
1. Klikaj na mapie narożniki obszaru (co najmniej 3). „↶ Punkt” usuwa ostatni.
2. **➕ Kolejny obszar** zamyka obszar i zaczyna następny (do 10).
3. Nadaj nazwę i kliknij **Zakończ i zbadaj**.

Wynik: obecne pokrycie, punkty wysokie do obsadzenia w kolejności z zyskiem każdego, **alternatywne miejsca** (1a, 1b, 1c) i końcowy zasięg (niebieski: już pokryte, turkusowy: dodane, czerwony: niepokryte). Domyślna wysokość anteny 6 m (1–60 m). Plik GPX z miejscami do pobrania.

## Teren całej Polski
Domyślnie mapa ma teren swojego obszaru. Żeby liczyć wszędzie: *Ustawienia › Mapa publiczna i teren* › **⬇ Pobierz teren całej Polski** (54 kwadraty, zaczyna od okolic mapy; kilka godzin, ok. 150 MB). Pobieranie działa dalej po zamknięciu strony i wznawia się po restarcie. Po zakończeniu mapa publiczna sama przełącza się na „całą Polskę”. Własna lista kwadratów: zmienna `RELIEF_KWADRATY` w `.env`.

Źródła: teren Copernicus DEM (ESA), szczyty i miejsca © współtwórcy OpenStreetMap (ODbL).
