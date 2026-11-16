# Topologia i symulacja

*Narzędzia › Topologia i symulacja MeshCore*.

## Analiza
- Graf **zmierzonych** łączy: układ swobodny, pierścień albo geograficzny; same repeatery albo wszystkie węzły.
- **Punkty krytyczne**: repeatery, których awaria odcięłaby węzły od obserwatorów.
- **Łącza krytyczne**, **najczęściej używane repeatery**, wyspy, węzły bez pozycji.

## Symulacja pakietu
Zgodnie z logiką firmware repeatera MeshCore: losowe opóźnienie zależne od `tx_delay_factor`, `flood.max`, kolizje. Animacja albo 200 losowań, żeby porównać ustawienia: odsetek osiągniętych węzłów, liczba nadawań, czas.

## Ruch na żywo
Prawdziwe pakiety są animowane na grafie (nadawca → repeater → obserwator), z najczęstszymi trasami i listą ostatnich pakietów.
