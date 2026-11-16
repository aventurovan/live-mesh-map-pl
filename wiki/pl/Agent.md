# Agent

Mały program (Windows, Linux, Raspberry Pi), który łączy z mapą:
- companiona **wpiętego przez USB** do tego komputera;
- **companiona Wi-Fi w innej sieci** (inny dom);
- od wersji 1.6 **dowolny moduł Wi-Fi w jego sieci lokalnej**, wskazany adresem IP w *Podłącz moduł*.

## Instalacja
1. Pobierz agenta z mapy: `/agent/live-mesh-agent-windows.exe` (albo wersje Linux i Raspberry Pi).
2. Uruchom. Poda adres serwera (port **4404**, w sieci lokalnej albo przez VPN) i **kod agentów** pokazany w mapie (*Sieć › Moduły radiowe › Moduł przez agenta*).
3. Dodaj połączenia: port USB (`COM5`, `/dev/ttyACM0`) albo adres Wi-Fi modułu.

W Windows proponuje automatyczny start po zalogowaniu. Opcje: `-configurer`, `-ajouter`, `-liste`, `-demarrage-auto`.

## Aktualizacja
Pobierz nową wersję z mapy i podmień plik; ustawienia (`live-mesh-agent.json`) zostają.

> 🔒 Port 4404 nigdy nie może być otwarty do internetu: tylko sieć lokalna albo VPN.
