#!/usr/bin/env python3
"""Turn Semgrep JSON output into a report fragment."""
import argparse
import json
import pathlib

from _md import code, text

BLOCKING = {"ERROR", "CRITICAL", "HIGH"}
MAX_ITEMS = 60


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", required=True)
    ap.add_argument("--exit-code", required=True, help="exit code of the semgrep run")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    out = pathlib.Path(args.out)

    def fail(reason):
        out.write_text(f"STATUS: fail\n### Semgrep\n- :x: The Semgrep scan did not complete: {reason}\n", encoding="utf-8")
        print("fail")

    if args.exit_code.strip() not in ("0", "1"):
        return fail(f"exit code {code(args.exit_code, 10)}")
    try:
        data = json.loads(pathlib.Path(args.json).read_text(encoding="utf-8"))
        results, scan_errors = data["results"], data.get("errors", [])
        scanned = len((data.get("paths") or {}).get("scanned") or [])
    except (OSError, ValueError, KeyError, TypeError) as exc:
        return fail(code(exc))
    fatal = [e for e in scan_errors if str(e.get("level", "")).lower() == "error"]
    if fatal:
        return fail(text(fatal[0].get("type", fatal[0].get("message", "error")), 120))

    def severity(r):
        return str(r.get("extra", {}).get("severity", "")).upper()

    errors = [r for r in results if severity(r) in BLOCKING]
    others = [r for r in results if severity(r) not in BLOCKING]
    status = "fail" if errors else ("warn" if others or scan_errors else "pass")

    def fmt(r):
        loc = f"{r.get('path', '?')}:{r.get('start', {}).get('line', '?')}"
        rule = str(r.get("check_id", "?")).split(".")[-1]
        return f"  - {code(loc)} **{text(rule, 80)}**: {text(r.get('extra', {}).get('message', ''), 240)}"

    lines = []
    if errors:
        lines.append(f"- :x: {len(errors)} blocking finding(s):")
        lines += [fmt(r) for r in errors[:MAX_ITEMS]]
    if others:
        lines.append(f"- :warning: {len(others)} finding(s) to confirm:")
        lines += [fmt(r) for r in others[:MAX_ITEMS]]
    if scan_errors:
        lines.append(f"- :warning: {len(scan_errors)} file(s) could not be fully analysed; review them by hand:")
        for e in scan_errors[:20]:
            where = e.get("path") or (e.get("spans") or [{}])[0].get("file") or "?"
            lines.append(f"  - {code(where)}: {text(e.get('type', e.get('message', 'error')), 80)}")
    if not lines:
        lines.append(f"- :white_check_mark: No new findings in {scanned} scanned file(s).")

    out.write_text(f"STATUS: {status}\n### Semgrep\n" + "\n".join(lines) + "\n", encoding="utf-8")
    print(status)


if __name__ == "__main__":
    main()
