# Konta i bezpieczeństwo

## Role
- **Administrator**: wszystko, łącznie z companionem, ustawieniami i kontami.
- **Menedżer obszaru**: administruje zdalnie i wypełnia karty instalacji **tylko węzłów swojego obszaru** (*Zarządzaj › Konta › Obszar…*).
- **Członek**: widzi wiadomości i dokładne pozycje.
- **Publiczny**: bez konta, pozycje prywatnych osób zaokrąglone, bez wiadomości.

Rejestracja: zamknięta, po akceptacji albo otwarta (*Ustawienia*).

## Ochrona kont
- **Logowanie dwuetapowe** (aplikacja TOTP: Google Authenticator, Aegis, 2FAS…) w *Moje konto*. Zalecane dla każdego, kto administruje repeaterami.
- **Wyloguj moje inne urządzenia** w razie zgubienia telefonu.
- **Dziennik** (*Zarządzaj › Dziennik*): logowania, odmowy, programowanie, konta, ustawienia. Hasła nigdy się w nim nie pojawiają.

## Blokada po błędnych logowaniach
- **3 błędy w 15 min z jednego adresu**: adres zablokowany na 15 min, każde powtórzenie w ciągu doby podwaja czas (do 24 h).
- **3 błędy w 15 min na jedno konto**: logowanie na to konto wstrzymane na 15 min. Z sieci lokalnej to wstrzymanie nie działa: administrator zawsze zaloguje się z domu.
- Blokady przetrwają restart; *Zarządzaj › Dziennik* ma przycisk **Odblokuj**.

## Sieć
- **Port 4404 (agenci)**: nigdy nie wystawiać do internetu. U nas mapa jest dostępna z internetu przez tunel Cloudflare (`live.meshcoresouth.pl`), a porty 1883/9001 brokera i 4404 nie są przekierowane na routerze.
- Za proxy mapa musi widzieć prawdziwe adresy odwiedzających (`PROXY_CONFIANCE`), inaczej jedna osoba mogłaby zablokować wszystkich.
- Hasła repeaterów i klucze kanałów są w prywatnych plikach na serwerze i w nocnych kopiach (*Zarządzaj › Kopie zapasowe*).
