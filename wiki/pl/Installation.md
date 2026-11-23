# Instalacja i aktualizacja

## Nasza instalacja
- Serwer: Proxmox › Ubuntu `meshcore-bot`, katalog **`/opt/live-mesh-map-pl`** (klon repozytorium [aventurovan/live-mesh-map-pl](https://github.com/aventurovan/live-mesh-map-pl)).
- Kontener **`live-mesh-map-pl`**, port **8080** (mapa), wolumen danych `live-mesh-map-pl_donnees` (baza, konta, teren).
- Dostęp z internetu: tunel Cloudflare **live.meshcoresouth.pl → 192.168.1.21:8080**.

## Aktualizacja
**Automatyczna**: timer `mapa-aktualizuj.timer` co 3 minuty sprawdza GitHub; gdy jest nowy commit, robi `git pull` i przebudowuje kontener. Opis i pliki do odtworzenia: `docs/auto-aktualizacja.md` oraz katalog `deploy/`. Historia:
```
journalctl -u mapa-aktualizuj -n 20 --no-pager
```
**Ręcznie, od razu**:
```
/usr/local/bin/mapa-aktualizuj.sh
```
Logi mapy:
```
cd /opt/live-mesh-map-pl && docker compose logs -f carte-live
```

## Plik `.env`
Ważniejsze zmienne w naszej wersji:

| Zmienna | Znaczenie |
|---|---|
| `DEPARTEMENT` | kwadrat obszaru mapy, u nas `MN49E019` |
| `ZONE_NOM`, `ZONE_BBOX` | nazwa i granice obszaru (Południe) |
| `CARTE_RESEAUX` | `meshcore` (tylko MeshCore) |
| `MESHCORE_IATA`, `MESHCORE_IATA_VOISINS` | `KTW`, `KRK` |
| `MESHCORE_RADIO_ATTENDUE` | `869.618,62.5,6,8` (SF6) |
| `MESHCORE_LIENS_OCTETS_MIN` | `2` (łącza tylko ze ścieżek 2-bajtowych) |
| `FONCTIONS_MASQUEES` | ukryte francuskie funkcje alarmowe |
| `RELIEF_KWADRATY` | własna lista kwadratów terenu (opcjonalnie) |
| `SF8_URL`, `MAPPER_API` | źródła warstw SF8 i Pomiary w terenie (puste = wyłączone) |
| `CLE_EQUIPES` | klucz szyfrujący; potrzebny do odtworzenia kopii |

Wartości zmienione w panelu **zastępują** `.env`. Po edycji `.env`: **`docker compose up -d`**.

## Kopie zapasowe
- **Pełna kopia** (*Ustawienia › 📦 Pełna kopia*): jeden plik `.tar.gz` z bazą, ustawieniami i kontami (bez terenu, który pobiera się ponownie). Na nowym serwerze: od razu w kreatorze **♻️ Przywróć pełną kopię…**.
- Trzymaj osobno także `/opt/live-mesh-map-pl/.env` (z `CLE_EQUIPES`).
- Mapa co noc sama zapisuje kopię ustawień (*Zarządzaj › Kopie zapasowe*).

## Pierwsze uruchomienie (nowy serwer)
```
git clone https://github.com/aventurovan/live-mesh-map-pl.git /opt/live-mesh-map-pl
cd /opt/live-mesh-map-pl && cp .env.exemple .env   # potem uzupełnij
docker compose up -d --build
```
Otwórz `http://ADRES_SERWERA:8080`: kreator utworzy konto administratora i ustawi broker. Z sieci lokalnej nie pyta o kod; z zewnątrz kod jest w logu (`docker compose logs carte-live | grep -i installation`).

> 🔒 Nigdy nie wystawiaj portu 4404 (agenci) do internetu.
