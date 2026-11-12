#!/usr/bin/env python3
"""Report the zizmor findings that a pull request introduces relative to its base."""
import argparse
import json
import pathlib

from _md import code, text


def findings(path):
    """Map (audit, workflow file, flagged source text) -> line number from `zizmor --format=json` output."""
    data = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("unexpected zizmor output")
    out = {}
    for f in data:
        loc = (f.get("locations") or [{}])[0]
        key = (loc.get("symbolic") or {}).get("key") or {}
        file = str((key.get("Local") or {}).get("verbatim_path") or key)
        file = file[file.find(".github/"):] if ".github/" in file else file
        concrete = loc.get("concrete") or {}
        row = (concrete.get("location") or {}).get("start_point", {}).get("row")
        source = " ".join(str(concrete.get("feature", "")).split())
        out[(str(f.get("ident", "?")), file, source)] = row + 1 if isinstance(row, int) else "?"
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", required=True)
    ap.add_argument("--base-json", default="")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    out = pathlib.Path(args.out)

    try:
        head = findings(args.json)
    except (OSError, ValueError) as exc:
        out.write_text(f"STATUS: fail\n### GitHub Actions workflows\n- :x: No zizmor result for the pull request: {code(exc)}\n", encoding="utf-8")
        print("fail")
        return
    try:
        base = findings(args.base_json) if args.base_json else {}
    except (OSError, ValueError):
        base = {}

    new = {k: row for k, row in head.items() if k not in base}
    existing = len(head) - len(new)
    status = "fail" if new else "pass"

    lines = []
    if new:
        lines.append("- :x: High-severity findings in workflow code that this PR adds or changes:")
        lines += [f"  - {code(f'{file}:{row}')} **{text(ident, 60)}**" for (ident, file, _), row in sorted(new.items(), key=lambda kv: (kv[0][1], str(kv[1])))[:60]]
    else:
        lines.append("- :white_check_mark: No new high-severity findings in `.github/`.")
    if existing:
        lines.append(f"- :information_source: {existing} high-severity finding(s) already present on the base branch.")

    out.write_text(f"STATUS: {status}\n### GitHub Actions workflows\n" + "\n".join(lines) + "\n", encoding="utf-8")
    print(status)


if __name__ == "__main__":
    main()
