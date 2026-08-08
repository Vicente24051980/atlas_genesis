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

tap_desc() {
  local desc="$1"
  dump_ui
  local coords
  coords="$(python3 - "$desc" <<'PY'
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
raise SystemExit(f'Accessibility node not found: {desc}')
PY
)"
  local x y
  read -r x y <<< "$coords"
  adb shell input tap "$x" "$y"
}

wait_for_text "FUNCTIONAL GATE"
wait_for_text "PASS"
wait_for_text "CORE-00"

verify_route() {
  local desc="$1"
  local expected="$2"
  tap_desc "$desc"
  wait_for_text "$expected"
  adb shell input keyevent 4
  wait_for_text "FUNCTIONAL GATE"
}

verify_route "Abrir Portfolio" "Guardar posición"
verify_route "Abrir Watchlist" "Añadir candidato"
verify_route "Abrir Radar" "Guardar señal"
verify_route "Abrir Evidence" "Guardar evidencia"
verify_route "Abrir Daily Intelligence" "Registrar decisión"
verify_route "Abrir Gemelo Digital" "Guardar Gemelo Digital"
verify_route "Abrir Audit" "Auditoría y trazabilidad"

echo "ATLAS Ω functional emulator gate: PASS"
