"""Escape pull request content before it goes into the Markdown report."""
import html
import unicodedata

_SPECIAL = "\\`*_[]()#!|~"


def _clean(value, limit):
    s = "".join(" " if unicodedata.category(c)[0] == "C" else c for c in str(value))
    s = " ".join(s.split())
    return s[:limit] + ("…" if len(s) > limit else "")


def code(value, limit=200):
    s = _clean(value, limit).replace("`", "'")
    return f"`{s}`" if s else "` `"


def text(value, limit=300):
    s = html.escape(_clean(value, limit), quote=False)
    s = "".join("\\" + c if c in _SPECIAL else c for c in s)
    return s.replace("@", "@​").replace("://", ":​//").replace("www.", "www​.")
