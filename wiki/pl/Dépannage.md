# Rozwiązywanie problemów

### Najpierw: Diagnostyka
*Ustawienia › 🩺 Diagnostyka* (administrator, albo ⚙️🔎 „diagnostyka”) sprawdza naraz: serwer MQTT, przychodzące dane, companiona, pakiety MeshCore pominięte przez obszar lub kod IATA, aktualizację, bazę i miejsce na dysku. Przy każdym problemie jest wyjaśnienie i przycisk do właściwego ustawienia.

### Mapa nie pokazuje nowych pakietów
- Sprawdź stan w pasku (**Na żywo** / **Broker rozłączony**).
- Na serwerze: `systemctl status mosquitto meshcore-capture`.
- Test brokera (hasło wpisywane bez echa):
  ```
  read -rsp "Haslo konta mapa: " P; echo
  mosquitto_sub -h 127.0.0.1 -u mapa -P "$P" -v -t 'meshcore/+/+/packets' -C 3 -W 180 | cut -c1-120
  unset P
  ```

### `getaddrinfo ENOTFOUND` w logu
Błąd w adresie brokera. Popraw w *Ustawieniach* albo w `.env`, potem `docker compose up -d`.

### Zmiana w `.env` nie działa
- Po edycji `.env` uruchom **`docker compose up -d`** (zwykły `restart` nie czyta `.env` ponownie).
- Wartość ustawiona w kreatorze lub w *Ustawieniach* **zastępuje** `.env`; strona to pokazuje i ma przycisk **Wróć do .env**.

### Nie mogę się zalogować
- 3 błędne próby w 15 min blokują adres na 15 min. Odblokowanie z innego konta administratora: *Zarządzaj › Dziennik*.
- Z sieci lokalnej konto nigdy nie jest blokowane, tylko adres.

### Po aktualizacji widzę starą wersję
Wciśnij **Ctrl+F5**. Pliki mają w adresie skrót zawartości, więc przeglądarka i Cloudflare pobierają nową wersję od razu po zmianie.

### Companion USB „połączony, ale cichy”
Otwarcie portu często restartuje companiona. Sprawdź, czy ma firmware **companion USB** (nie BLE i nie repeater), zamknij inne programy używające portu, użyj **↻ Ponów** albo odłącz i podłącz ponownie. Na naszym serwerze oba porty USB są zajęte przez bota i capture.

### Companion odłączony przez „innego klienta”
Companion obsługuje jednego klienta naraz; często to aplikacja w telefonie.

### Repeater solarny znika w nocy
Za mały akumulator lub panel. Włącz telemetrię (np. co 1 h) i sprawdzaj krzywą napięcia.

### Łącza z innej sieci zostają na mapie
Wciśnij **✕ Wyczyść mapę** w pasku albo odśwież stronę.

### Ukrycie punktów wysokich
*Warstwy › Punkty wysokie* (wybór jest zapamiętywany). Na stałe dla całej mapy: `CARTE_COUCHES_MASQUEES=sommets` w `.env`.
