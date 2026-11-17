#!/usr/bin/env python3
"""Classify the changed files of a pull request against the path policy."""
import argparse
import json
import re
import sys
import unicodedata

from _md import code

ALLOWED_BASE_FOR_FORKS = "develop"
SPECIAL_MODES = {"120000": "symlink", "160000": "submodule"}
MEDIA_EXTENSIONS = (
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".bmp",
    ".woff", ".woff2", ".ttf", ".otf", ".eot", ".mp4", ".webm", ".mp3", ".pdf",
)
MAX_LIST = 80


def glob_to_regex(pattern):
    if pattern.endswith("/"):
        return re.compile(re.escape(pattern[:-1]) + "(/.*)?", re.IGNORECASE | re.DOTALL)
    out, i = "", 0
    while i < len(pattern):
        if pattern.startswith("**", i):
            out += ".*"
            i += 2
        elif pattern[i] == "*":
            out += "[^/]*"
            i += 1
        else:
            out += re.escape(pattern[i])
            i += 1
    return re.compile(out, re.IGNORECASE | re.DOTALL)


def parse_raw(data):
    """Parse `git diff --raw --no-renames -z` output into (new_mode, path) pairs."""
    fields = data.split("\0")
    entries, i = [], 0
    while i + 1 < len(fields):
        meta, path = fields[i], fields[i + 1]
        parts = meta[1:].split(" ")
        if not meta.startswith(":") or len(parts) != 5 or parts[4][:1] in ("R", "C"):
            raise ValueError(f"unexpected diff record: {meta[:40]!r}")
        entries.append((parts[1], path))
        i += 2
    return entries


def parse_numstat(data):
    """Return the paths that `git diff --numstat --no-renames -z` reports as binary."""
    binary = []
    for record in data.split("\0"):
        parts = record.split("\t", 2)
        if len(parts) == 3 and parts[0] == "-" and parts[1] == "-":
            binary.append(parts[2])
    return binary


def unusual(path):
    return "\\" in path or "�" in path or any(unicodedata.category(c)[0] == "C" for c in path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--policy", required=True)
    ap.add_argument("--raw", required=True, help="output of git diff --raw --no-renames -z")
    ap.add_argument("--numstat", default="", help="output of git diff --numstat --no-renames -z")
    ap.add_argument("--fork", action="store_true")
    ap.add_argument("--base", default="")
    ap.add_argument("--out", default="")
    args = ap.parse_args()

    with open(args.policy, encoding="utf-8") as f:
        policy = json.load(f)
    with open(args.raw, encoding="utf-8", errors="replace") as f:
        entries = parse_raw(f.read())
    binary = []
    if args.numstat:
        with open(args.numstat, encoding="utf-8", errors="replace") as f:
            binary = [p for p in parse_numstat(f.read()) if not p.lower().endswith(MEDIA_EXTENSIONS)]

    forbidden_rules = [(p, glob_to_regex(p)) for p in policy["forbidden"]]
    review_rules = [(p, glob_to_regex(p)) for p in policy["review_required"]]
    forbidden, review, special, odd = [], [], [], []
    for mode, path in entries:
        if mode in SPECIAL_MODES:
            special.append((path, SPECIAL_MODES[mode]))
        if unusual(path):
            odd.append(path)
        rule = next((p for p, rx in forbidden_rules if rx.fullmatch(path)), None)
        if rule:
            forbidden.append((path, rule))
            continue
        rule = next((p for p, rx in review_rules if rx.fullmatch(path)), None)
        if rule:
            review.append((path, rule))

    status, lines = "pass", []
    strict = "fail" if args.fork else "warn"
    icon = ":x:" if args.fork else ":warning:"

    def raise_to(level):
        nonlocal status
        if level == "fail" or status == "pass":
            status = level

    def listed(items, fmt):
        out = [fmt(i) for i in items[:MAX_LIST]]
        if len(items) > MAX_LIST:
            out.append(f"  - … and {len(items) - MAX_LIST} more")
        return out

    if args.fork and args.base and args.base != ALLOWED_BASE_FOR_FORKS:
        raise_to("fail")
        lines.append(f"- :x: Pull requests from forks must target `{ALLOWED_BASE_FOR_FORKS}`; this one targets {code(args.base)}.")
    if odd:
        raise_to(strict)
        lines.append(f"- {icon} File names with control characters, backslashes or invalid encoding:")
        lines += listed(odd, lambda p: f"  - {code(p)}")
    if special:
        raise_to(strict)
        lines.append(f"- {icon} Symbolic links or submodules added or changed:")
        lines += listed(special, lambda x: f"  - {code(x[0])} ({x[1]})")
    if binary:
        raise_to(strict)
        lines.append(f"- {icon} Non-media files that git treats as binary, so their content is not shown in diffs:")
        lines += listed(binary, lambda p: f"  - {code(p)}")
    if forbidden:
        raise_to(strict)
        if args.fork:
            lines.append("- :x: Files external contributors may not change:")
        else:
            lines.append("- :warning: Pipeline/infrastructure files changed (internal PR, maintainer review required):")
        lines += listed(forbidden, lambda x: f"  - {code(x[0])} (rule {code(x[1])})")
    if review:
        raise_to("warn")
        lines.append("- :warning: Security-sensitive files changed; a maintainer must review each change:")
        lines += listed(review, lambda x: f"  - {code(x[0])} (rule {code(x[1])})")
    if not lines:
        lines.append(f"- :white_check_mark: No sensitive paths among the {len(entries)} changed file(s).")

    report = f"STATUS: {status}\n### Path policy\n" + "\n".join(lines) + "\n"
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(report)
    print(report)
    sys.exit(1 if status == "fail" else 0)


if __name__ == "__main__":
    main()
