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
  for _ in $(seq 1 50); do
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
        match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.attrib.get('bounds', ''))
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

ensure_atlas_tab() {
  for _ in $(seq 1 8); do
    dump_ui
    if grep -Fq "MÓDULOS ATLAS Ω" window.xml 2>/dev/null; then
      return 0
    fi
    for _ in $(seq 1 6); do adb shell input swipe 540 650 540 1850 150 || true; done
    dump_ui
    if coords="$(find_desc_coords "Abrir ATLAS Ω" 2>/dev/null)"; then
      local x y
      read -r x y <<< "$coords"
      adb shell input tap "$x" "$y"
      sleep 1
    fi
  done
  wait_for_text_with_scroll "MÓDULOS ATLAS Ω"
}

return_home() {
  adb shell input keyevent 4
  sleep 1
  wait_for_text "MARKET SCANNER"
  ensure_atlas_tab
}

wait_for_text "MARKET SCANNER"
wait_for_text "MERCADO"
wait_for_text "SCANNER Ω"
wait_for_text_with_scroll "Tendencias actuales"

# The ticker-detail route must be reachable even if the remote provider is unavailable.
for _ in $(seq 1 8); do adb shell input swipe 540 650 540 1850 150 || true; done
tap_desc "Abrir SPY"
wait_for_text "SPY"
adb shell input keyevent 4
sleep 1
wait_for_text "MARKET SCANNER"

ensure_atlas_tab

verify_route() {
  local desc="$1"
  local expected="$2"
  echo "Verifying ATLAS route: $desc -> $expected"
  tap_desc "$desc"
  wait_for_text_with_scroll "$expected"
  wait_for_text_with_scroll "ANALIZAR"
  return_home
}

verify_route "Abrir Resumen" "Resumen Ω"
verify_route "Abrir Mercado" "Mercado Ω"
verify_route "Abrir Growth Ω" "Growth Ω"
verify_route "Abrir Business Quality Ω" "Business Quality Ω"
verify_route "Abrir CAPEX Productivity Ω" "CAPEX Productivity Ω"
verify_route "Abrir Valuation Ω" "Valuation Ω"
verify_route "Abrir Risk Ω" "Risk Ω"
verify_route "Abrir Catalysts Ω" "Catalysts Ω"
verify_route "Abrir News Ω" "News Ω"

echo "ATLAS Ω scanner-first emulator gate: PASS"
