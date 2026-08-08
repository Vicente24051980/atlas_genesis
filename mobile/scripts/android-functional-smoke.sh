#!/usr/bin/env bash
set -euo pipefail

APK="$(find candidate-apk -type f -name '*.apk' | head -n 1)"
test -n "$APK"

adb install -r "$APK"
adb shell am force-stop com.vicentebellver.atlasomega || true
adb shell am start -W -n com.vicentebellver.atlasomega/.MainActivity

dump_ui() {
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml window.xml >/dev/null 2>&1 || true
}

wait_for_text() {
  local needle="$1"
  for _ in $(seq 1 45); do
    dump_ui
    if grep -Fq "$needle" window.xml 2>/dev/null; then
      return 0
    fi
    sleep 2
  done
  echo "::error::Timed out waiting for UI text: $needle"
  cat window.xml 2>/dev/null || true
  return 1
}

wait_for_text_with_scroll() {
  local needle="$1"
  for _ in $(seq 1 10); do
    dump_ui
    if grep -Fq "$needle" window.xml 2>/dev/null; then
      return 0
    fi
    adb shell input swipe 540 1800 540 650 250
    sleep 1
  done
  echo "::error::Could not find UI text after scrolling: $needle"
  cat window.xml 2>/dev/null || true
  return 1
}

find_desc_coords() {
  local desc="$1"
  python3 - "$desc" <<'PY'
import re
import sys
import xml.etree.ElementTree as ET

desc = sys.argv[1]
root = ET.parse('window.xml').getroot()
for node in root.iter('node'):
    if node.attrib.get('content-desc') == desc:
        bounds = node.attrib.get('bounds', '')
        match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', bounds)
        if not match:
            continue
        x1, y1, x2, y2 = map(int, match.groups())
        print(f'{(x1 + x2)//2} {(y1 + y2)//2}')
        raise SystemExit(0)
raise SystemExit(1)
PY
}

tap_desc() {
  local desc="$1"
  local coords=""
  for _ in $(seq 1 10); do
    dump_ui
    if coords="$(find_desc_coords "$desc")"; then
      local x y
      read -r x y <<< "$coords"
      adb shell input tap "$x" "$y"
      return 0
    fi
    adb shell input swipe 540 1800 540 650 250
    sleep 1
  done
  echo "::error::Accessibility node not found after scrolling: $desc"
  cat window.xml 2>/dev/null || true
  return 1
}

return_home() {
  adb shell input keyevent 4
  sleep 1
  for _ in $(seq 1 8); do
    adb shell input swipe 540 600 540 1900 200 || true
  done
  wait_for_text "FUNCTIONAL GATE"
}

wait_for_text "FUNCTIONAL GATE"
wait_for_text "PASS"
wait_for_text "CORE-00"

verify_route() {
  local desc="$1"
  local expected="$2"
  echo "Verifying route: $desc -> $expected"
  tap_desc "$desc"
  wait_for_text_with_scroll "$expected"
  return_home
}

verify_route "Abrir Portfolio" "Guardar posición"
verify_route "Abrir Watchlist" "Añadir candidato"
verify_route "Abrir Radar" "Guardar señal"
verify_route "Abrir Evidence" "Guardar evidencia"
verify_route "Abrir Daily Intelligence" "Registrar decisión"
verify_route "Abrir Gemelo Digital" "Guardar Gemelo Digital"
verify_route "Abrir Audit" "Auditoría y trazabilidad"

echo "ATLAS Ω functional emulator gate: PASS"
