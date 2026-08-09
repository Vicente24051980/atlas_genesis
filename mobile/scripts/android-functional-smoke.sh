#!/usr/bin/env bash
set -euo pipefail
APK="$(find candidate-apk -type f -name '*.apk' | head -n 1)"; test -n "$APK"
adb install -r "$APK"
adb shell am force-stop com.vicentebellver.atlasomega || true
adb shell am start -W -n com.vicentebellver.atlasomega/.MainActivity

dump_ui(){ adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1||true; adb pull /sdcard/window.xml window.xml >/dev/null 2>&1||true; }
wait_for_text(){ local needle="$1"; for _ in $(seq 1 45);do dump_ui;if grep -Fq "$needle" window.xml 2>/dev/null;then return 0;fi;sleep 2;done;echo "::error::Timed out waiting for UI text: $needle";cat window.xml 2>/dev/null||true;return 1; }
wait_for_text_with_scroll(){ local needle="$1";for _ in $(seq 1 14);do dump_ui;if grep -Fq "$needle" window.xml 2>/dev/null;then return 0;fi;adb shell input swipe 540 1800 540 650 250;sleep 1;done;echo "::error::Could not find UI text after scrolling: $needle";cat window.xml 2>/dev/null||true;return 1; }
coords_for_attr(){ local attr="$1" value="$2";python3 - "$attr" "$value" <<'PY'
import re,sys,xml.etree.ElementTree as ET
root=ET.parse('window.xml').getroot();attr,val=sys.argv[1:]
for n in root.iter('node'):
    if n.attrib.get(attr)==val:
        m=re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]',n.attrib.get('bounds',''))
        if m:
            x1,y1,x2,y2=map(int,m.groups());print(f'{(x1+x2)//2} {(y1+y2)//2}');raise SystemExit(0)
raise SystemExit(1)
PY
}
tap_attr(){ local attr="$1" value="$2" scroll="${3:-yes}" coords='';for _ in $(seq 1 14);do dump_ui;if coords="$(coords_for_attr "$attr" "$value")";then read -r x y<<<"$coords";adb shell input tap "$x" "$y";return 0;fi;if [ "$scroll" = yes ];then adb shell input swipe 540 1800 540 650 250;sleep 1;else break;fi;done;echo "::error::Node not found: $attr=$value";cat window.xml 2>/dev/null||true;return 1; }
tap_desc(){ tap_attr content-desc "$1" yes; }
tap_text(){ tap_attr text "$1" no; }
return_home(){ adb shell input keyevent 4;sleep 1;for _ in $(seq 1 8);do adb shell input swipe 540 600 540 1900 180||true;done;wait_for_text "COMMAND CENTER"; }
wait_for_text "COMMAND CENTER";wait_for_text "RUNTIME";wait_for_text "PASS";wait_for_text "CORE RULES";
# Semantic E2E: real app -> HTTP -> deterministic engines -> persistence -> rendered audit.
tap_desc "Abrir Terminal";wait_for_text "INTELLIGENCE TERMINAL";tap_text "AUDIT Ω";wait_for_text "NVIDIA Corporation · CI FIXTURE";wait_for_text "QUALITY Ω";wait_for_text "FLOW Ω";wait_for_text_with_scroll "HARD REQUIREMENTS";wait_for_text_with_scroll "PENDING";return_home
verify_route(){ local desc="$1" expected="$2";echo "Verifying route: $desc -> $expected";tap_desc "$desc";wait_for_text_with_scroll "$expected";return_home; }
verify_route "Abrir Portfolio Live" "PORTFOLIO LIVE"
verify_route "Abrir Discovery" "DISCOVERY RADAR"
verify_route "Abrir Downside Radar" "EARLY DOWNSIDE RADAR"
verify_route "Abrir Sectores" "SECTOR INTELLIGENCE"
verify_route "Abrir Watchlist" "Watchlist"
verify_route "Abrir Model Validation" "MODEL VALIDATION"
verify_route "Abrir Evidence Ω" "Evidence"
verify_route "Abrir Audit History" "Auditoría"
echo "ATLAS Ω functional + semantic Android emulator gate: PASS"
