#!/usr/bin/env bash
set -euo pipefail

PACKAGE="com.vicentebellver.atlasomega"
ACTIVITY="$PACKAGE/.MainActivity"
APK="$(find candidate-apk -type f -name '*.apk' | head -n 1)"
test -n "$APK"

adb install -r "$APK"
adb shell am force-stop "$PACKAGE" || true
adb shell am start -W -n "$ACTIVITY"

SIZE="$(adb shell wm size | tr -d '\r' | grep -Eo '[0-9]+x[0-9]+' | tail -n 1)"
DEVICE_W="${SIZE%x*}"
DEVICE_H="${SIZE#*x}"
: "${DEVICE_W:=1080}"
: "${DEVICE_H:=2400}"
CENTER_X=$((DEVICE_W / 2))
UP_FROM_Y=$((DEVICE_H * 82 / 100))
UP_TO_Y=$((DEVICE_H * 28 / 100))
DOWN_FROM_Y=$((DEVICE_H * 28 / 100))
DOWN_TO_Y=$((DEVICE_H * 82 / 100))

echo "ATLAS smoke viewport: ${DEVICE_W}x${DEVICE_H}"

adb shell settings put global hide_error_dialogs 1 >/dev/null 2>&1 || true
adb shell settings put global anr_show_background 0 >/dev/null 2>&1 || true

capture_ui() {
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml window.xml >/dev/null 2>&1 || true
}

dump_ui() {
  capture_ui
  if grep -Eq "ATLAS Ω isn't responding|ATLAS.*keeps stopping|com\.vicentebellver\.atlasomega.*isn't responding" window.xml 2>/dev/null; then
    echo "::error::ATLAS runtime error dialog detected"
    cat window.xml || true
    return 1
  fi
}

swipe_up() { adb shell input swipe "$CENTER_X" "$UP_FROM_Y" "$CENTER_X" "$UP_TO_Y" 220; }
swipe_down() { adb shell input swipe "$CENTER_X" "$DOWN_FROM_Y" "$CENTER_X" "$DOWN_TO_Y" 180; }

wait_for_text() {
  local needle="$1"
  for _ in $(seq 1 50); do
    dump_ui
    if grep -Fq "$needle" window.xml 2>/dev/null; then return 0; fi
    sleep 2
  done
  echo "::error::Timed out waiting for UI text: $needle"
  cat window.xml 2>/dev/null || true
  return 1
}

wait_for_text_with_scroll() {
  local needle="$1"
  for _ in $(seq 1 16); do
    dump_ui
    if grep -Fq "$needle" window.xml 2>/dev/null; then return 0; fi
    swipe_up
    sleep 1
  done
  echo "::error::Could not find UI text after scrolling: $needle"
  cat window.xml 2>/dev/null || true
  return 1
}

find_desc_coords() {
  local desc="$1"
  python3 - "$desc" "$DEVICE_W" "$DEVICE_H" <<'PY'
import re, sys, xml.etree.ElementTree as ET

desc, width, height = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
root = ET.parse('window.xml').getroot()
for node in root.iter('node'):
    if node.attrib.get('content-desc') != desc:
        continue
    match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.attrib.get('bounds', ''))
    if not match:
        continue
    x1, y1, x2, y2 = map(int, match.groups())
    if x2 <= 0 or y2 <= 0 or x1 >= width or y1 >= height:
        continue
    print(f'{max(1, min(width - 2, (x1 + x2)//2))} {max(1, min(height - 2, (y1 + y2)//2))}')
    raise SystemExit(0)
raise SystemExit(1)
PY
}

tap_desc() {
  local desc="$1" coords=""
  for _ in $(seq 1 18); do
    dump_ui
    if coords="$(find_desc_coords "$desc")"; then
      local x y
      read -r x y <<< "$coords"
      echo "Tapping '$desc' at $x,$y"
      adb shell input tap "$x" "$y"
      sleep 1
      return 0
    fi
    swipe_up
    sleep 1
  done
  echo "::error::Accessibility node not found: $desc"
  cat window.xml 2>/dev/null || true
  return 1
}

open_deep_link() {
  local route="$1"
  adb shell am start -W -a android.intent.action.VIEW -d "atlasomega://$route" "$PACKAGE" >/dev/null 2>&1 || \
    adb shell am start -W -a android.intent.action.VIEW -d "atlasomega:///$route" "$PACKAGE" >/dev/null 2>&1
  sleep 1
}

# Home must be a real command center with portfolio/watchlist access.
wait_for_text "INVESTMENT INTELLIGENCE"
wait_for_text "MI CARTERA Ω"
wait_for_text "WATCHLIST Ω"
wait_for_text "Cartera"
wait_for_text "Radar Ω"

# Fixed bottom navigation routes.
tap_desc "Cartera"
wait_for_text "Mi Cartera Ω"
wait_for_text "PORTFOLIO INTELLIGENCE"

tap_desc "Watchlist"
wait_for_text "Watchlist Ω"
wait_for_text "CANDIDATE INTELLIGENCE"

tap_desc "Radar Ω"
wait_for_text "Radar Ω"
wait_for_text "ROTACIÓN Ω"
wait_for_text "DISLOCATION Ω"

tap_desc "Más"
wait_for_text "Más"
wait_for_text "Motores ATLAS Ω"
wait_for_text_with_scroll "Evidence Ω"
wait_for_text_with_scroll "Decision Log Ω"
wait_for_text_with_scroll "Broker Ω"

# Broker must no longer expose a manual private-token form.
tap_desc "Abrir Broker Ω"
wait_for_text "BROKER Ω"
wait_for_text_with_scroll "SEGURIDAD"
dump_ui
if grep -Fq "Token privado del Broker Ω" window.xml 2>/dev/null || grep -Fq "CONTROL TOKEN" window.xml 2>/dev/null; then
  echo "::error::Legacy manual Broker control-token UI is still visible"
  cat window.xml
  exit 1
fi
adb shell input keyevent 4
sleep 1
wait_for_text "Más"

# Decision Log route exists without requiring manual data entry.
tap_desc "Abrir Decision Log Ω"
wait_for_text "Historial de decisiones"
adb shell input keyevent 4
sleep 1
wait_for_text "Más"

# Ticker terminal route itself must boot independently of remote data availability.
open_deep_link "ticker?symbol=SPY&context=candidate"
wait_for_text "SPY"

# Every analytical module must be a distinct screen, not the old shared-data facade.
verify_engine_route() {
  local route="$1" title="$2"
  echo "Verifying engine route: $route -> $title"
  open_deep_link "$route"
  wait_for_text "$title"
  wait_for_text "ANALIZAR"
}

verify_engine_route "overview" "Resumen Ω"
verify_engine_route "growth" "Growth Ω"
verify_engine_route "quality" "Business Quality Ω"
verify_engine_route "capex-productivity" "CAPEX Productivity Ω"
verify_engine_route "valuation" "Valuation Ω"
verify_engine_route "risk" "Risk Ω"
verify_engine_route "catalysts" "Catalysts Ω"
verify_engine_route "news" "News Ω"

# Evidence Ω is ticker-only and primary-source oriented.
open_deep_link "evidence"
wait_for_text "Evidence Ω"
wait_for_text "Ticker para Evidence Ω"
dump_ui
if grep -Fq "Guardar evidencia" window.xml 2>/dev/null; then
  echo "::error::Legacy manual Evidence form is still visible"
  exit 1
fi

# Global market screen is separate from per-ticker analysis.
open_deep_link "market"
wait_for_text "Mercados Ω"
wait_for_text "MARKET SENSOR"

echo "ATLAS Ω definitive mobile emulator gate: PASS"
