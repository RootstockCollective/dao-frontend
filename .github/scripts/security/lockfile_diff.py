#!/usr/bin/env python3
"""Compare two npm lockfiles and verify every new or changed package against the npm registry."""
import argparse
import base64
import binascii
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from _md import code

REGISTRY = "https://registry.npmjs.org"
NAME_RE = re.compile(r"^(@[a-z0-9~-][a-z0-9._~-]*/)?[a-z0-9~-][a-z0-9._~-]*$")
VERSION_RE = re.compile(r"^[0-9A-Za-z.+-]{1,100}$")
INSTALL_SCRIPTS = ("preinstall", "install", "postinstall")
DEP_FIELDS = ("dependencies", "devDependencies", "optionalDependencies", "peerDependencies")
ROOT_HOOKS = ("preinstall", "install", "postinstall", "preprepare", "prepare", "postprepare")
MAX_VERIFY = 1500
MAX_LIST = 40


class BadLockfile(Exception):
    pass


def dep_specs(meta):
    out = {}
    for field in DEP_FIELDS:
        value = meta.get(field)
        if isinstance(value, dict):
            out.update({str(k): str(v) for k, v in value.items()})
    return out


def load_packages(path):
    try:
        with open(path, encoding="utf-8") as f:
            lock = json.load(f)
    except (OSError, ValueError) as exc:
        raise BadLockfile(f"cannot parse lockfile: {exc}") from exc
    if not isinstance(lock, dict) or lock.get("lockfileVersion") not in (2, 3) or not isinstance(lock.get("packages"), dict):
        raise BadLockfile("lockfileVersion 2 or 3 with a `packages` section is required")
    pkgs = {}
    for key, meta in lock["packages"].items():
        if not key:
            continue
        if not isinstance(meta, dict):
            raise BadLockfile("malformed package entry")
        key_name = key.rsplit("node_modules/", 1)[-1]
        pkgs[key] = {
            "key": key,
            "key_name": key_name,
            "name": str(meta.get("name") or key_name),
            "version": str(meta.get("version", "")),
            "resolved": str(meta.get("resolved", "")),
            "integrity": str(meta.get("integrity", "")),
            "install_script": bool(meta.get("hasInstallScript")),
            "link": bool(meta.get("link")),
            "bundled": bool(meta.get("inBundle")),
            "deps": dep_specs(meta),
            "bins": set(meta["bin"]) if isinstance(meta.get("bin"), dict) else set(),
        }
    return pkgs


def signature(m):
    return (m["name"], m["version"], m["resolved"], m["integrity"], m["link"], m["bundled"])


def label(m):
    return f"{code(m['name'])}@{code(m['version'])}"


def expected_url(name, version):
    return f"{REGISTRY}/{name}/-/{name.rsplit('/', 1)[-1]}-{version}.tgz"


def fetch_manifest(name_version):
    """Return the registry manifest, None when the version does not exist, or an Exception."""
    name, version = name_version
    if not NAME_RE.match(name) or not VERSION_RE.match(version):
        return ValueError("invalid package name or version")
    url = f"{REGISTRY}/{urllib.parse.quote(name, safe='@')}/{urllib.parse.quote(version, safe='')}"
    last = None
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"Accept": "application/json"}), timeout=20) as r:
                return json.load(r)
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                return None
            last = exc
        except (urllib.error.URLError, OSError, ValueError) as exc:
            last = exc
    return last


def tarball_problems(entry, doc):
    dist = doc.get("dist") or {}
    problems = []
    if dist.get("tarball") != entry["resolved"]:
        problems.append("`resolved` is not the tarball the registry publishes for this version")
    if dist.get("integrity"):
        if dist["integrity"] != entry["integrity"]:
            problems.append("`integrity` does not match the registry")
    else:
        try:
            sha1 = binascii.hexlify(base64.b64decode(entry["integrity"][5:], validate=True)).decode()
        except (binascii.Error, ValueError):
            sha1 = ""
        if not entry["integrity"].startswith("sha1-") or sha1 != dist.get("shasum"):
            problems.append("`integrity` does not match the registry checksum")
    return problems


def has_install_script(doc):
    scripts = doc.get("scripts") or {}
    return bool(doc.get("hasInstallScript") or doc.get("gypfile") or any(scripts.get(s) for s in INSTALL_SCRIPTS))


def bundling_ancestor(key, head):
    """Return (ancestor entry, name directly under it) for an entry that claims to be bundled."""
    parts = key.split("/node_modules/")
    for i in range(len(parts) - 1, 0, -1):
        ancestor = head.get("/node_modules/".join(parts[:i]))
        if ancestor and (ancestor["resolved"] or ancestor["integrity"]):
            return ancestor, parts[i]
    return None, None


def root_hooks(path):
    """Return the install-time scripts of a root package.json, or None when it cannot be read."""
    try:
        with open(path, encoding="utf-8") as f:
            scripts = json.load(f).get("scripts") or {}
        return {k: str(scripts[k]) for k in ROOT_HOOKS if scripts.get(k)}
    except (OSError, ValueError, AttributeError, TypeError):
        return None


def manifest_bins(doc):
    value = doc.get("bin")
    if isinstance(value, dict):
        return set(value)
    if isinstance(value, str) and value:
        return {str(doc.get("name", "")).rsplit("/", 1)[-1]}
    return set()


def listed(items):
    out = list(items[:MAX_LIST])
    if len(items) > MAX_LIST:
        out.append(f"  - … and {len(items) - MAX_LIST} more")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True)
    ap.add_argument("--head", required=True)
    ap.add_argument("--package-json", default="", help="head package.json, for declared aliases")
    ap.add_argument("--base-package-json", default="", help="base package.json, to compare install-time scripts")
    ap.add_argument("--fork", action="store_true", help="the pull request comes from a fork")
    ap.add_argument("--shrinkwrap-present", action="store_true")
    ap.add_argument("--out", default="")
    ap.add_argument("--no-registry", action="store_true", help="skip registry verification (local testing only)")
    args = ap.parse_args()

    def finish(status, lines):
        report = f"STATUS: {status}\n### Lockfile\n" + "\n".join(lines) + "\n"
        if args.out:
            with open(args.out, "w", encoding="utf-8") as f:
                f.write(report)
        print(report)
        sys.exit(1 if status == "fail" else 0)

    try:
        head = load_packages(args.head)
    except BadLockfile as exc:
        finish("fail", [f"- :x: Head lockfile rejected: {code(exc)}"])
    try:
        base = load_packages(args.base)
    except BadLockfile:
        base = {}
    root_specs = {}
    if args.package_json:
        try:
            with open(args.package_json, encoding="utf-8") as f:
                root_specs = dep_specs(json.load(f))
        except (OSError, ValueError, AttributeError):
            root_specs = {}

    changed = [m for k, m in head.items() if k not in base or signature(base[k]) != signature(m)]
    failures = []          # report lines, each one fails the check
    tarballs = []          # entries to compare with the registry
    bundles = []           # (entry, ancestor, name under ancestor)
    aliases = []           # (entry, [declaring entries])
    alias_notes = []
    approvals = []         # need explicit approval: fail for a fork, warn otherwise
    bin_notes = []

    if args.package_json and args.base_package_json:
        head_hooks, base_hooks = root_hooks(args.package_json), root_hooks(args.base_package_json) or {}
        if head_hooks is None:
            failures.append("  - `package.json` of the pull request cannot be parsed")
        else:
            for hook, command in sorted(head_hooks.items()):
                if base_hooks.get(hook) != command:
                    verb = "changed" if hook in base_hooks else "added"
                    approvals.append(f"  - `package.json` script {code(hook)} {verb}; it runs on every install: {code(command, 160)}")

    if args.shrinkwrap_present:
        failures.append("  - `npm-shrinkwrap.json` exists; npm uses it instead of `package-lock.json` and it is not verified")

    for m in changed:
        b = base.get(m["key"])
        own_tarball = bool(m["resolved"] or m["integrity"])
        if m["link"]:
            failures.append(f"  - {code(m['key'])}: `link` entries are not accepted")
            continue
        if m["bundled"]:
            if own_tarball:
                failures.append(f"  - {label(m)}: marked `inBundle` but has its own tarball")
                continue
            ancestor, top = bundling_ancestor(m["key"], head)
            if not ancestor:
                failures.append(f"  - {code(m['key'])}: marked `inBundle` but no package bundles it")
            else:
                bundles.append((m, ancestor, top))
                approvals.append(f"  - {code(m['key'])}: shipped inside {label(ancestor)}; its content and scripts cannot be checked against the registry")
            continue
        if not NAME_RE.match(m["name"]) or not VERSION_RE.match(m["version"]):
            failures.append(f"  - {label(m)}: invalid package name or version")
            continue
        if m["resolved"] != expected_url(m["name"], m["version"]):
            failures.append(f"  - {label(m)}: `resolved` is {code(m['resolved'] or '(missing)')}, not the registry tarball for this name and version")
            continue
        if not m["integrity"]:
            failures.append(f"  - {label(m)}: missing `integrity`")
            continue
        if b and (b["name"], b["version"]) == (m["name"], m["version"]) and (b["resolved"], b["integrity"]) != (m["resolved"], m["integrity"]):
            failures.append(f"  - {label(m)}: tarball or integrity changed without a version change")
            continue
        tarballs.append(m)
        if m["name"] != m["key_name"]:
            if root_specs.get(m["key_name"], "").startswith(f"npm:{m['name']}@") and m["key"] == f"node_modules/{m['key_name']}":
                alias_notes.append(f"{code(m['name'])} installed as {code(m['key_name'])} (declared in `package.json`)")
            else:
                declaring = [d for d in head.values() if d["deps"].get(m["key_name"], "").startswith(f"npm:{m['name']}@") and (d["resolved"] or d["integrity"])]
                aliases.append((m, declaring[:5]))

    needed = {(m["name"], m["version"]) for m in tarballs}
    needed |= {(a["name"], a["version"]) for _, a, _ in bundles}
    needed |= {(d["name"], d["version"]) for _, ds in aliases for d in ds}
    manifests, unverified = {}, 0
    if args.no_registry:
        unverified = len(needed)
    elif len(needed) > MAX_VERIFY:
        failures.append(f"  - {len(needed)} packages changed; more than the {MAX_VERIFY} that are verified in one run. Split the dependency change.")
    elif not failures:
        order = sorted(needed)
        with ThreadPoolExecutor(max_workers=8) as pool:
            manifests = dict(zip(order, pool.map(fetch_manifest, order)))

    def manifest(m):
        doc = manifests.get((m["name"], m["version"]))
        if isinstance(doc, dict):
            return doc, None
        if doc is None:
            return None, "version does not exist in the npm registry"
        return None, f"registry lookup failed ({code(doc)})"

    base_script_names = {m["name"] for m in base.values() if m["install_script"]}
    new_scripts = {(m["name"], m["version"]) for m in changed if m["install_script"] and m["name"] not in base_script_names}
    known_scripts = set()
    if manifests:
        for m in tarballs:
            doc, error = manifest(m)
            if error:
                failures.append(f"  - {label(m)}: {error}")
                continue
            failures += [f"  - {label(m)}: {p}" for p in tarball_problems(m, doc)]
            if has_install_script(doc):
                (known_scripts if m["name"] in base_script_names else new_scripts).add((m["name"], m["version"]))
            if m["key"] == f"node_modules/{m['key_name']}":
                for command in sorted(manifest_bins(doc)):
                    owners = sorted(o["name"] for k, o in head.items() if k != m["key"] and k == f"node_modules/{o['key_name']}" and command in o["bins"])
                    if owners:
                        bin_notes.append(f"  - {label(m)} declares the command {code(command)}, also provided by {', '.join(code(o) for o in owners[:3])}")
        for m, ancestor, top in bundles:
            doc, error = manifest(ancestor)
            bundled = (doc or {}).get("bundleDependencies") or (doc or {}).get("bundledDependencies") or []
            if error:
                failures.append(f"  - {code(m['key'])}: cannot confirm bundling by {label(ancestor)}: {error}")
            elif bundled is not True and top not in bundled:
                failures.append(f"  - {code(m['key'])}: marked `inBundle`, but {label(ancestor)} does not bundle {code(top)}")
        for m, declaring in aliases:
            confirmed = None
            for d in declaring:
                doc, _ = manifest(d)
                if doc and dep_specs(doc).get(m["key_name"], "").startswith(f"npm:{m['name']}@"):
                    confirmed = d
                    break
            if confirmed:
                alias_notes.append(f"{code(m['name'])} installed as {code(m['key_name'])} (declared by {label(confirmed)})")
            else:
                failures.append(f"  - {code(m['key'])}: installs {label(m)} under the name {code(m['key_name'])} and no `package.json` declares that alias")
    elif args.no_registry:
        failures += [f"  - {code(m['key'])}: alias of {label(m)} not verified" for m, _ in aliases]

    base_names = {m["name"] for m in base.values()}
    head_names = {m["name"] for m in head.values()}
    added = sorted(head_names - base_names)
    removed = sorted(base_names - head_names)
    base_versions = {}
    for m in base.values():
        base_versions.setdefault(m["name"], set()).add(m["version"])
    bumped = sorted({(m["name"], m["version"]) for m in changed if m["name"] in base_versions and m["version"] not in base_versions[m["name"]]})

    status, lines = "pass", []
    if failures:
        status = "fail"
        lines.append("- :x: Lockfile or `package.json` content that is not accepted:")
        lines += listed(failures)
    if new_scripts:
        status = "fail"
        lines.append("- :x: Packages with an install script that no version in the base lockfile had (needs explicit maintainer approval):")
        lines += listed([f"  - {code(n)}@{code(v)}" for n, v in sorted(new_scripts)])
    if approvals:
        if args.fork:
            status = "fail"
            lines.append("- :x: Changes that need explicit maintainer approval:")
        else:
            status = "warn" if status == "pass" else status
            lines.append("- :warning: Changes a maintainer must confirm:")
        lines += listed(approvals)
    if bin_notes:
        status = "warn" if status == "pass" else status
        lines.append("- :warning: Command names declared by more than one package; check which one the build runs:")
        lines += listed(bin_notes)
    if unverified:
        status = "warn" if status == "pass" else status
        lines.append(f"- :warning: {unverified} changed package(s) were not verified against the registry.")
    if added:
        status = "warn" if status == "pass" else status
        lines.append(f"- :warning: {len(added)} new package(s): " + ", ".join(code(n) for n in added[:MAX_LIST]) + (" …" if len(added) > MAX_LIST else ""))
    if alias_notes:
        status = "warn" if status == "pass" else status
        lines.append("- :warning: Aliased packages added or changed: " + "; ".join(alias_notes[:MAX_LIST]))
    if known_scripts:
        status = "warn" if status == "pass" else status
        lines.append("- :warning: Added or changed entries of packages that run an install script (as on the base branch): " + ", ".join(f"{code(n)}@{code(v)}" for n, v in sorted(known_scripts)[:MAX_LIST]))
    if bumped:
        lines.append(f"- :information_source: {len(bumped)} version change(s): " + ", ".join(f"{code(n)}@{code(v)}" for n, v in bumped[:MAX_LIST]) + (" …" if len(bumped) > MAX_LIST else ""))
    if removed:
        lines.append(f"- :information_source: {len(removed)} removed package(s): " + ", ".join(code(n) for n in removed[:MAX_LIST]) + (" …" if len(removed) > MAX_LIST else ""))
    if not lines:
        lines.append("- :white_check_mark: No package changes.")
    elif status == "pass":
        lines.insert(0, f"- :white_check_mark: {len(changed)} changed entr{'y' if len(changed) == 1 else 'ies'} verified against the npm registry.")
    finish(status, lines)


if __name__ == "__main__":
    main()
