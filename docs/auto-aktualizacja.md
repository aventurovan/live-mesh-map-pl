# Automatyczna aktualizacja mapy (live.meshcoresouth.pl)

**Mapa aktualizuje się sama.** Każdy commit wysłany do gałęzi `main` trafia na serwer w ciągu ok. 3 minut, bez niczyjego udziału.

Mechanizm **nie jest częścią obrazu Dockera ani `docker-compose.yml`** – to timer systemd na serwerze. Dlatego przeglądając samo repozytorium łatwo dojść do błędnego wniosku, że automatu nie ma. Ten plik i katalog [`deploy/`](../deploy) są jego opisem i kopią wzorcową.

## Jak to działa
1. `mapa-aktualizuj.timer` co 3 minuty uruchamia `mapa-aktualizuj.service`.
2. Usługa wywołuje `/usr/local/bin/mapa-aktualizuj.sh`, który robi `git fetch` w `/opt/live-mesh-map-pl`.
3. Jeśli `origin/main` ma nowy commit: `git pull` i `docker compose up -d --build carte-live` (obraz budowany lokalnie na serwerze).
4. Jeśli nic nowego – nic się nie dzieje.

Usługa `maj` i gotowe obrazy z GitHub Actions (mechanizm oryginału sauveteur71) **nie są u nas używane i nie są potrzebne**. Workflow `image-docker.yml` został w repozytorium po oryginale.

## Sprawdzenie
```
systemctl list-timers mapa-aktualizuj.timer
journalctl -u mapa-aktualizuj -n 20 --no-pager
```
Wersja działająca na mapie: https://live.meshcoresouth.pl/api/version (pole `version` = `carte-live/package.json`).

Aktualizacja od razu, bez czekania:
```
sudo /usr/local/bin/mapa-aktualizuj.sh
```

## Instalacja na nowym serwerze (np. przy przenosinach)
Po sklonowaniu repozytorium do `/opt/live-mesh-map-pl` i pierwszym `docker compose up -d --build`:
```
sudo cp /opt/live-mesh-map-pl/deploy/mapa-aktualizuj.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/mapa-aktualizuj.sh
sudo cp /opt/live-mesh-map-pl/deploy/mapa-aktualizuj.service /opt/live-mesh-map-pl/deploy/mapa-aktualizuj.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mapa-aktualizuj.timer
```
Jeśli repozytorium jest w innym katalogu, zmień `KATALOG=` w skrypcie.

> Pliki w `deploy/` to kopia wzorcowa odtworzona z działającej konfiguracji. Na obecnym serwerze działa wersja zainstalowana wcześniej – nie trzeba jej podmieniać.
