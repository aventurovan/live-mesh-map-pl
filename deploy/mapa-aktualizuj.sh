#!/bin/sh
# Automatyczna aktualizacja mapy z GitHuba (uruchamiana co 3 min przez mapa-aktualizuj.timer).
# Kopia wzorcowa – na serwerze leży w /usr/local/bin/mapa-aktualizuj.sh.
# Gdy w origin/main jest nowy commit: git pull + przebudowa kontenera. Inaczej nic nie robi.
set -eu
KATALOG=/opt/live-mesh-map-pl
cd "$KATALOG"
git fetch --quiet origin main
LOKALNY=$(git rev-parse HEAD)
ZDALNY=$(git rev-parse origin/main)
[ "$LOKALNY" = "$ZDALNY" ] && exit 0
echo "Nowa wersja: ${LOKALNY%"${LOKALNY#???????}"} → ${ZDALNY%"${ZDALNY#???????}"}"
git pull --quiet --ff-only origin main
docker compose up -d --build carte-live
docker image prune -f >/dev/null 2>&1 || true
echo "Mapa zaktualizowana."
