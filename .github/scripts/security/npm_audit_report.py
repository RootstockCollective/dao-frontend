#!/usr/bin/env python3
"""Report the npm audit advisories that a pull request introduces relative to its base."""
import argparse
import json
import pathlib

from _md import code, text

BLOCKING = {"high", "critical"}
ORDER = {"critical": 0, "high": 1, "moderate": 2, "low": 3, "info": 4}


def advisories(path):
    """Map (package, advisory) -> (severity, title, range, installed copies) from `npm audit --json` output."""
    data = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    if "error" in data or not isinstance(data.get("vulnerabilities"), dict):
        raise ValueError("npm audit did not return a vulnerability report")
    out = {}
    for name, v in data["vulnerabilities"].items():
        copies = len(v.get("nodes") or []) or 1
        for via in v.get("via", []):
            if isinstance(via, dict):
                key = (name, str(via.get("url") or via.get("source") or via.get("title")))
                out[key] = (str(via.get("severity", "unknown")).lower(), str(via.get("title", "")), str(via.get("range", "")), copies)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", required=True)
    ap.add_argument("--base-json", default="")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    out = pathlib.Path(args.out)

    try:
        head = advisories(args.json)
    except (OSError, ValueError) as exc:
        out.write_text(f"STATUS: fail\n### npm audit\n- :x: No audit result for the pull request: {code(exc)}\n", encoding="utf-8")
        print("fail")
        return
    try:
        base = advisories(args.base_json) if args.base_json else {}
    except (OSError, ValueError):
        base = {}

    new = {k: v for k, v in head.items() if k not in base}
    more = {k: v for k, v in head.items() if k in base and v[3] > base[k][3]}
    fixed = len([k for k in base if k not in head])
    blocking = [k for k, v in new.items() if v[0] in BLOCKING]
    status = "fail" if blocking else ("warn" if new or more else "pass")

    def rows(items, extra=lambda k, v: ""):
        ordered = sorted(items.items(), key=lambda kv: (ORDER.get(kv[1][0], 9), kv[0]))[:60]
        return [f"  - **{text(sev, 20)}** {code(name)} {code(rng)}: {text(title, 160)}{extra((name, adv), (sev, title, rng, n))}" for (name, adv), (sev, title, rng, n) in ordered]

    lines = []
    if new:
        lines.append(f"- {':x:' if blocking else ':warning:'} {len(new)} advisor{'y' if len(new) == 1 else 'ies'} introduced by this PR ({len(blocking)} high/critical):")
        lines += rows(new)
    if more:
        lines.append("- :warning: More installed copies of packages with an advisory that the base branch already has:")
        lines += rows(more, lambda k, v: f" ({base[k][3]} → {v[3]} copies)")
    if not new and not more:
        lines.append("- :white_check_mark: No new advisories introduced by this PR.")
    if fixed:
        lines.append(f"- :information_source: {fixed} advisor{'y' if fixed == 1 else 'ies'} no longer apply with this PR.")
    existing = len(head) - len(new)
    if existing:
        lines.append(f"- :information_source: {existing} advisor{'y' if existing == 1 else 'ies'} already present on the base branch.")

    out.write_text(f"STATUS: {status}\n### npm audit\n" + "\n".join(lines) + "\n", encoding="utf-8")
    print(status)


if __name__ == "__main__":
    main()
