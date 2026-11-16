# Podłączenie companiona

Companion podłączony do mapy odbiera ruch bezpośrednio, wysyła wiadomości i **administruje repeaterami**. Wszystko z **Narzędzia › 🔌 Podłącz moduł…**; mapa sama rozpoznaje companiona MeshCore.

## Wi-Fi (adres IP)
Companion na płytkach ESP32-S3 (Heltec V3/V4, XIAO ESP32-S3…) z firmware 1.18+ może dołączyć do Wi-Fi (aplikacja MeshCore › Ustawienia › Wi-Fi). Nadaj mu stały adres w routerze i wpisz go w *Podłącz moduł* (port **5000**). Połączenie jest stałe i nie wymaga otwartej karty przeglądarki. Jeśli companion jest w innej sieci, mapa użyje [[agenta|Agent]] uruchomionego w tamtej sieci.

## USB na serwerze
Companion z firmware **companion USB** wpięty w serwer mapy. W `docker-compose.yml`, w usłudze `carte-live`, na tym samym wcięciu co `mem_limit`:
```
    devices: ["/dev/ttyACM0:/dev/ttyACM0"]
    group_add: ["dialout"]
```
potem `docker compose up -d` i *Podłącz moduł › 🖥️ USB serwera*. Port może mieć otwarty tylko jeden program (u nas oba porty USB używają bot i capture).

## Bluetooth lub USB w przeglądarce
Wymaga **HTTPS** oraz **Chrome lub Edge**. Aplikacja w telefonie musi być odłączona od companiona. Karta przeglądarki musi zostać otwarta; po zerwaniu strona łączy się ponownie sama.

## Kilka modułów
Jeden companion jest **główny** (wysyła i administruje), kolejne mogą być **nasłuchujące**: to, co słyszą, trafia na mapę z ich własnym SNR.

## Który companion do administracji
Companion mapy musi **dobrze słyszeć** repeatery, którymi administrujesz. Do prac w terenie najskuteczniejszy jest companion **blisko celu**, np. w samochodzie przez Bluetooth.
