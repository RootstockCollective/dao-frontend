#!/usr/bin/env python3
"""Merge the report fragments into one PR comment and a verdict."""
import argparse
import hashlib
import os
import pathlib
import sys

from _md import code

MARKER = "<!-- security-validation-report -->"
ORDER = ["paths", "lockfile", "audit", "semgrep", "constants", "secrets", "workflows"]
RANK = {"pass": 0, "warn": 1, "fail": 2}
ICON = {"pass": ":white_check_mark:", "warn": ":warning:", "fail": ":x:"}
MAX_BODY = 60000
MAX_SECTION = 8000


def digest(directory):
    h = hashlib.sha256()
    for name in ORDER:
        p = pathlib.Path(directory) / f"{name}.md"
        h.update(name.encode() + b"\0" + (p.read_bytes() if p.is_file() else b"<missing>") + b"\0")
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--digest", action="store_true", help="print the digest of the fragments and exit")
    ap.add_argument("--sha", default="")
    ap.add_argument("--run-url", default="")
    ap.add_argument("--out", default="")
    ap.add_argument("--analyze-result", default="")
    ap.add_argument("--expected-digest", default="")
    ap.add_argument("--full-out", default="", help="untruncated report, for the job summary")
    args = ap.parse_args()

    if args.digest:
        print(digest(args.dir))
        return
    if not (args.sha and args.run_url and args.out):
        sys.exit("--sha, --run-url and --out are required")

    trusted = args.analyze_result == "success" and args.expected_digest and digest(args.dir) == args.expected_digest
    fragments = {}
    if trusted:
        for name in ORDER:
            p = pathlib.Path(args.dir) / f"{name}.md"
            first, _, body = (p.read_text(encoding="utf-8") if p.is_file() else "").partition("\n")
            status = first.replace("STATUS:", "").strip().lower()
            if not first.startswith("STATUS:") or status not in RANK:
                status, body = "fail", f"### {name}\n- :x: Check did not produce a report.\n"
            fragments[name] = (status, body)
        verdict = max((s for s, _ in fragments.values()), key=lambda s: RANK[s])
    else:
        verdict = "fail"

    parts = [
        MARKER,
        f"## Security validation: {ICON[verdict]} **{verdict.upper()}**",
        f"Commit {code(args.sha, 64)} · [workflow run]({args.run_url})",
        "",
    ]
    if trusted:
        parts += [" · ".join(f"{ICON[fragments[n][0]]} {n}" for n in ORDER), ""]
        for n in ORDER:
            section = fragments[n][1].rstrip()
            if len(section) > MAX_SECTION:
                section = section[:MAX_SECTION].rsplit("\n", 1)[0] + "\n- :warning: Section truncated; the workflow run summary has the full list."
            parts.append(section + "\n")
    else:
        parts.append(f"- :x: The analysis job did not finish (result: {code(args.analyze_result or 'unknown', 20)}) or its results could not be verified. See the workflow run.\n")
    body = "\n".join(parts)
    if len(body) > MAX_BODY:
        body = body[:MAX_BODY] + "\n\n_Report truncated; see the workflow run for the full output._\n"
    body += (
        "\n<sub>Deterministic checks only. `warn` items need a maintainer to confirm each one against the PR description; "
        "`fail` blocks merge. A new push to the PR requires a new validation.</sub>\n"
    )
    pathlib.Path(args.out).write_text(body, encoding="utf-8")
    if args.full_out and trusted:
        full = "\n".join(fragments[n][1].rstrip() + "\n" for n in ORDER)
        pathlib.Path(args.full_out).write_text(f"## Security validation: {verdict.upper()}\n\n{full}", encoding="utf-8")

    gh_out = os.environ.get("GITHUB_OUTPUT")
    if gh_out:
        with open(gh_out, "a", encoding="utf-8") as f:
            f.write(f"verdict={verdict}\n")
    print(f"verdict={verdict}")


if __name__ == "__main__":
    main()
