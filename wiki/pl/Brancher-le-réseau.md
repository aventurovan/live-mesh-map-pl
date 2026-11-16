# Źródła danych (MQTT)

## Broker MQTT
Mapa subskrybuje `meshcore/#` (tematy Meshtastic `msh/…` są w tej wersji wyłączone).
- Obserwatorzy (companion + packet capture) publikują pakiety w formacie meshcoretomqtt: `meshcore/<IATA>/<KLUCZ>/packets` i `…/status`.
- Konto mapy na brokerze musi mieć prawo **odczytu** `meshcore/#` (zapis tylko, jeśli mapa ma republikować pakiety swojego companiona).
- Adres, użytkownik i hasło: *Ustawienia › Źródła › Broker MQTT* albo `MQTT_URL`, `MQTT_UTILISATEUR`, `MQTT_MOT_DE_PASSE` w `.env`. Ustawienia z panelu zastępują `.env`.
- Mapa działa w kontenerze, więc lokalny broker podajesz adresem IP serwera (np. `mqtt://192.168.1.21:1883`), nie `127.0.0.1`.

## Obszar i obserwatorzy
- **Kod obszaru (IATA)**: 3 litery, u nas `MESHCORE_IATA=KTW`, sąsiedni `MESHCORE_IATA_VOISINS=KRK`.
- **Zatrzymywane pakiety**: obszar mapy, obszar i sąsiedzi albo cały kraj (`MESHCORE_PERIMETRE`).
- Obserwatorzy bez pozycji są przyjmowani po kodzie IATA.

## Kanały
*Ustawienia* albo `MESHCORE_CANAUX` w `.env`, jeden na linię: `Public`, `#nazwa`, `Nazwa=sekret`. Pakiety z nieznanym kluczem widać jako zaszyfrowane.

## Companion mapy
Opcjonalny do oglądania mapy, **niezbędny** do administrowania repeaterami i wysyłania wiadomości. Zobacz [[Podłączenie companiona|Connecter-un-module]].
