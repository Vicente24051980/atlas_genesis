#!/usr/bin/env bash
set -euo pipefail

PACKAGE="com.vicentebellver.atlasomega"
ACTIVITY="$PACKAGE/.MainActivity"
APK="$(find candidate-apk -type f -name '*.apk' | head -n 1)"
test -s "$APK"

adb install -r "$APK"
adb shell am force-stop "$PACKAGE" || true
adb shell am start -W -n "$ACTIVITY"

capture_ui() {
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml window.xml >/dev/null 2>&1 || true
  if grep -Eq "isn't responding|keeps stopping|has stopped" window.xml 2>/dev/null; then
    echo "::error::ATLAS runtime error dialog detected"
    cat window.xml || true
    exit 1
  fi
}

wait_text() {
  local needle="$1"
  for _ in $(seq 1 35); do
    capture_ui
    if grep -Fq "$needle" window.xml 2>/dev/null; then return 0; fi
    sleep 2
  done
  echo "::error::Timed out waiting for: $needle"
  cat window.xml 2>/dev/null || true
  exit 1
}

tap_desc() {
  local desc="$1"
  for _ in $(seq 1 10); do
    capture_ui
    local coords
    coords="$(python3 - "$desc" <<'PY' || true
import re, sys, xml.etree.ElementTree as ET
needle=sys.argv[1]
root=ET.parse('window.xml').getroot()
for node in root.iter('node'):
    if node.attrib.get('content-desc') != needle:
        continue
    m=re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.attrib.get('bounds',''))
    if m:
        x1,y1,x2,y2=map(int,m.groups())
        print((x1+x2)//2, (y1+y2)//2)
        raise SystemExit(0)
raise SystemExit(1)
PY
)"
    if [ -n "$coords" ]; then
      read -r x y <<< "$coords"
      adb shell input tap "$x" "$y"
      sleep 1
      return 0
    fi
    adb shell input swipe 540 1800 540 700 220 || true
    sleep 1
  done
  echo "::error::Accessibility node not found: $desc"
  cat window.xml 2>/dev/null || true
  exit 1
}

wait_text "Investment Intelligence"
wait_text "Acciones principales"

tap_desc "Analizar ticker"
wait_text "Analizar empresa"
adb shell input keyevent 4
wait_text "Investment Intelligence"

tap_desc "Cartera 36"
wait_text "Cartera 36"
adb shell input keyevent 4
wait_text "Investment Intelligence"

tap_desc "Estado del sistema"
wait_text "Estado del sistema"
wait_text "SEGURIDAD"

capture_ui
echo "ATLAS Ω Mobile v1 clean UI gate: PASS"
