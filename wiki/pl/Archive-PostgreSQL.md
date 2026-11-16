# Archiwum PostgreSQL

Mapa trzyma kilka dni historii w bazie SQLite. **Opcjonalne** archiwum PostgreSQL kopiuje **cały ruch** do długich statystyk, Grafany albo zapytań SQL.

## Włączenie
*Zarządzaj › Archiwum PostgreSQL* (administrator):
1. Serwer, port, baza, użytkownik, hasło, SSL.
2. **Testuj połączenie**.
3. **Przechowuj**: zawsze albo od 10 lat do 1 tygodnia.
4. **Maksymalny rozmiar**: bez limitu albo od 100 GB do 1 GB; po przekroczeniu najstarsze dane są usuwane.
5. Zaznacz **Włącz archiwum** i **Zapisz**. Restart nie jest potrzebny.

## Dołączony kontener PostgreSQL
W `.env`: `POSTGRES_MOT_DE_PASSE=dlugie-haslo`, potem `docker compose --profile postgres up -d`. W mapie: serwer **postgres**, port 5432, baza **carte**, użytkownik **carte**.

## Co jest kopiowane
Co 20 s tabele MeshCore: `mc_noeuds`, `mc_paquets`, `mc_receptions`, `mc_messages`, `mc_telemetrie`, `mc_liens` (nazwy oryginalne, po francusku).
