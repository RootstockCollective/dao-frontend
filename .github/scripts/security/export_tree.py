#!/usr/bin/env python3
"""Export the regular files under a path of a git commit, ignoring attributes and ignore files."""
import argparse
import pathlib
import subprocess
import sys
import unicodedata


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sha", required=True)
    ap.add_argument("--path", required=True)
    ap.add_argument("--dest", required=True)
    args = ap.parse_args()

    dest = pathlib.Path(args.dest).resolve()
    listing = subprocess.run(["git", "ls-tree", "-r", "-z", args.sha, "--", args.path], check=True, capture_output=True).stdout
    count = 0
    for record in listing.split(b"\0"):
        if not record:
            continue
        meta, _, raw_path = record.partition(b"\t")
        mode, kind, blob = meta.decode().split(" ")
        path = raw_path.decode("utf-8", errors="replace")
        if kind != "blob" or mode not in ("100644", "100755"):
            continue
        if "\\" in path or "�" in path or any(unicodedata.category(c)[0] == "C" for c in path):
            continue
        target = (dest / path).resolve()
        if dest not in target.parents:
            sys.exit(f"refusing to write outside the destination: {path!r}")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(subprocess.run(["git", "cat-file", "blob", blob], check=True, capture_output=True).stdout)
        count += 1
    print(f"exported {count} file(s) from {args.sha[:12]}:{args.path}")


if __name__ == "__main__":
    main()
