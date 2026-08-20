#!/usr/bin/env bash
set -euo pipefail

PACKAGE="com.vicentebellver.atlasomega"
ACTIVITY="$PACKAGE/.MainActivity"
APK="$(find candidate-apk -type f -name '*.apk' | head -n 1)"
test -s "$APK"

adb install -r "$APK"
adb shell am force-stop "$PACKAGE" || true
adb shell am start -W -n "$ACTIVITY"

node_center_by_resource_id() {
  local resource_id="$1"
  python3 - "$resource_id" <<'PY' || true
import re, sys, xml.etree.ElementTree as ET
needle=sys.argv[1]
try:
    root=ET.parse('window.xml').getroot()
except Exception:
    raise SystemExit(1)
for node in root.iter('node'):
    if node.attrib.get('resource-id') != needle:
        continue
    m=re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.attrib.get('bounds',''))
    if m:
        x1,y1,x2,y2=map(int,m.groups())
        print((x1+x2)//2, (y1+y2)//2)
        raise SystemExit(0)
raise SystemExit(1)
PY
}

dismiss_emulator_noise() {
  if grep -Fq "Pixel Launcher isn't responding" window.xml 2>/dev/null; then
    local coords
    coords="$(node_center_by_resource_id 'android:id/aerr_wait')"
    if [ -n "$coords" ]; then
      read -r x y <<< "$coords"
      adb shell input tap "$x" "$y" || true
    else
      adb shell input keyevent 4 || true
    fi
    sleep 1
    return 0
  fi
}

capture_ui() {
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml window.xml >/dev/null 2>&1 || true
  dismiss_emulator_noise
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  adb pull /sdcard/window.xml window.xml >/dev/null 2>&1 || true

  if grep -Eiq "ATLAS( Ω)? (isn't responding|keeps stopping|has stopped)|atlasomega (isn't responding|keeps stopping|has stopped)" window.xml 2>/dev/null; then
    echo "::error::ATLAS runtime error dialog detected"
    cat window.xml || true
    adb logcat -d | tail -n 400 || true
    exit 1
  fi
}

wait_text() {
  local needle="$1"
  for _ in $(seq 1 35); do
    capture_ui
    if grep -Fiq "$needle" window.xml 2>/dev/null; then return 0; fi
    sleep 2
  done
  echo "::error::Timed out waiting for: $needle"
  cat window.xml 2>/dev/null || true
  adb logcat -d | tail -n 400 || true
  exit 1
}

tap_desc() {
  local desc="$1"
  for _ in $(seq 1 12); do
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
  adb logcat -d | tail -n 400 || true
  exit 1
}

# Terminal home must render the new portfolio-first shell.
wait_text "Portfolio First"
wait_text "GLOBAL INDICES"
wait_text "LIVE PORTFOLIO · TRADING 212"
wait_text "PRIMARY WORKSPACES"

# Core mobile navigation must be reachable from persistent terminal controls.
tap_desc "AUD, Auditar"
wait_text "ATLAS TERMINAL · AUDIT"
wait_text "Auditar"
adb shell input keyevent 4
wait_text "Portfolio First"

tap_desc "WL, Watchlist"
wait_text "ATLAS TERMINAL · WATCHLIST"
wait_text "Watchlist"
adb shell input keyevent 4
wait_text "Portfolio First"

tap_desc "RES, Resultados"
wait_text "RESULTADOS"
adb shell input keyevent 4
wait_text "Portfolio First"

capture_ui
echo "ATLAS Ω terminal Android launch/navigation gate: PASS"
