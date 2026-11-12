#!/usr/bin/env python3
"""List addresses, URLs, chain IDs and encoded literals changed by a diff (read from stdin)."""
import argparse
import re
import sys
import urllib.parse

from _md import code

ADDRESS = re.compile(r"0x[a-fA-F0-9]{40}\b")
URL = re.compile(r"""(?:https?|wss?|ipfs|ftp):\\?/\\?/?[^\s'"`<>)\]},\\]+""", re.IGNORECASE)
RELATIVE_URL = re.compile(r"""['"`]((?:\\?/){2}[A-Za-z0-9.-]+\.[A-Za-z]{2,}[^\s'"`<>)\]},\\]*)""")
CHAIN_IDS = (
    re.compile(r"chain_?id\w*\s*[:=]\s*['\"]?(0x[0-9a-f]+|\d{1,10})", re.IGNORECASE),
    re.compile(r"eip155:(\d{1,10})", re.IGNORECASE),
)
CHAIN_ID_KEY = re.compile(r"\bid\s*:\s*['\"]?(0x[0-9a-f]+|\d{1,10})", re.IGNORECASE)
BLOB = re.compile(
    r"[A-Za-z0-9+/_-]{120,}={0,2}|(?:\\x[0-9a-fA-F]{2}){30,}|(?:\\u\{?[0-9a-fA-F]{2,6}\}?){30,}|(?:%[0-9A-Fa-f]{2}){30,}"
)
IGNORED_URL_PREFIXES = ("http://www.w3.org/",)
LOW_PRIORITY = re.compile(r"^(docs|cypress)/|\.(md|snap)$|\.(test|stories)\.[jt]sx?$", re.IGNORECASE)
MAX_LOW_PRIORITY = 40
MAX_ROWS = 400


def describe_url(token):
    normal = token.replace("\\/", "/")
    normal = re.sub(r"^([A-Za-z]+):/(?!/)", r"\1://", normal)
    try:
        parts = urllib.parse.urlsplit(normal if "://" in normal else "https:" + normal)
        host = parts.hostname or "?"
        note = " (has credentials before the host)" if parts.username is not None else ""
    except ValueError:
        host, note = "?", ""
    return f"host {code(host, 100)}{note}: {code(token, 300)}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="")
    args = ap.parse_args()

    found = {"EVM addresses": {}, "URLs": {}, "Chain IDs": {}}  # token -> {"added": files, "removed": files}
    blobs, binaries = set(), set()
    current, in_header = "", True

    def record(label, token, side):
        found[label].setdefault(token, {"added": set(), "removed": set()})[side].add(current)

    for raw in sys.stdin.buffer:
        line = raw.decode("utf-8", errors="replace").rstrip("\n")
        if line.startswith("diff --git "):
            in_header, current = True, ""
            continue
        if in_header:
            if line.startswith("+++ "):
                current = line[6:] if line.startswith("+++ b/") else current
            elif line.startswith("--- a/") and not current:
                current = line[6:]
            elif line.startswith("@@"):
                in_header = False
            elif line.startswith(("Binary files ", "GIT binary patch")):
                binaries.add(line)
            continue
        if not line or line[0] not in "+-":
            continue
        side, body = ("added" if line[0] == "+" else "removed"), line[1:]
        for m in ADDRESS.finditer(body):
            record("EVM addresses", m.group(0), side)
        for m in URL.finditer(body):
            if not m.group(0).lower().startswith(IGNORED_URL_PREFIXES):
                record("URLs", m.group(0), side)
        for m in RELATIVE_URL.finditer(body):
            record("URLs", m.group(1), side)
        for rx in CHAIN_IDS:
            for m in rx.finditer(body):
                record("Chain IDs", m.group(1), side)
        if "chain" in body.lower():
            for m in CHAIN_ID_KEY.finditer(body):
                record("Chain IDs", m.group(1), side)
        if side == "added" and BLOB.search(body):
            blobs.add(current)

    lines = []
    for label, tokens in found.items():
        rows = []
        for token, sides in tokens.items():
            files = sorted(sides["added"] | sides["removed"])
            if sides["added"] and sides["removed"]:
                tag = "moved" if sides["added"] == sides["removed"] else "added (also removed elsewhere)"
            else:
                tag = "added" if sides["added"] else "removed"
            important = any(not LOW_PRIORITY.search(f) for f in (sides["added"] or files))
            where = ", ".join(code(f, 120) for f in files[:3]) + (" …" if len(files) > 3 else "")
            shown = describe_url(token) if label == "URLs" else code(token)
            rows.append((not important, tag.startswith("removed"), token, f"  - {tag}: {shown} ({where})"))
        rows.sort()
        main_rows = [r[3] for r in rows if not r[0]]
        low_rows = [r[3] for r in rows if r[0]]
        if rows:
            lines.append(f"- :warning: {label}:")
            lines += main_rows[:MAX_ROWS]
            if len(main_rows) > MAX_ROWS:
                lines.append(f"  - :x: {len(main_rows) - MAX_ROWS} more in source files are not listed; review the diff directly")
            lines += low_rows[:MAX_LOW_PRIORITY]
            if len(low_rows) > MAX_LOW_PRIORITY:
                lines.append(f"  - … and {len(low_rows) - MAX_LOW_PRIORITY} more in docs, tests and stories")
    if blobs:
        lines.append("- :warning: Long encoded literals added in:")
        lines += [f"  - {code(f, 120)}" for f in sorted(blobs)[:60]]
    if binaries:
        lines.append(f"- :warning: {len(binaries)} file(s) were not compared as text.")

    status = "warn" if lines else "pass"
    if not lines:
        lines.append("- :white_check_mark: No addresses, URLs, chain IDs or encoded literals changed.")

    report = f"STATUS: {status}\n### Sensitive constants in the diff\n" + "\n".join(lines) + "\n"
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(report)
    print(report)


if __name__ == "__main__":
    main()
