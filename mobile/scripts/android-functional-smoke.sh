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
  for _ in $(seq 1 12); do
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

assert_text_absent() {
  local needle="$1"
  dump_ui
  if grep -Fq "$needle" window.xml 2>/dev/null; then
    echo "::error::Legacy manual UI is still present: $needle"
    cat window.xml 2>/dev/null || true
    return 1
  fi
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
  for _ in $(seq 1 12); do
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
  for _ in $(seq 1 10); do
    adb shell input swipe 540 600 540 1900 180 || true
  done
  wait_for_text "AUTOMATION LAYER"
}

wait_for_text "FUNCTIONAL GATE"
wait_for_text "PASS"
wait_for_text "AUTOMATION LAYER"
wait_for_text "CORE-00"

verify_route() {
  local desc="$1"
  local expected="$2"
  echo "Verifying automated route: $desc -> $expected"
  tap_desc "$desc"
  wait_for_text_with_scroll "$expected"
  return_home
}

verify_route "Abrir Fuentes de datos" "Guardar · sincronizar · automatizar"
verify_route "Abrir Portfolio" "Portfolio automático"
verify_route "Abrir Watchlist" "Watchlist Ω automática"
verify_route "Abrir Discovery" "Discovery Ω global"
verify_route "Abrir Radar" "Radar Ω automático"
verify_route "Abrir Evidence" "Primary Inbox"
verify_route "Abrir Daily Intelligence" "Daily Intelligence automático"
verify_route "Abrir Gemelo Digital" "Guardar Gemelo Digital"
verify_route "Abrir Audit" "Auditoría y trazabilidad"

# Explicitly prove that the market workflow no longer exposes the rejected manual forms.
tap_desc "Abrir Portfolio"
assert_text_absent "Guardar posición"
return_home

tap_desc "Abrir Watchlist"
assert_text_absent "Añadir candidato"
return_home

tap_desc "Abrir Radar"
assert_text_absent "Guardar señal"
return_home

tap_desc "Abrir Daily Intelligence"
assert_text_absent "Registrar decisión"
return_home

echo "ATLAS Ω automated functional emulator gate: PASS"
