# dotfiles

Managed with [chezmoi](https://www.chezmoi.io/). The repo lives at
`~/repos/pqrth/dotfiles` and `.chezmoiroot` points chezmoi at `home/`, so
repo meta files (this README, `hooks/`, the repo's own `.gitignore`) stay out
of the source state.

chezmoi **copies** rather than symlinks. That matters: tools that rewrite their
own config — `p10k configure` especially — write to the real file in `$HOME`,
where the change can be reviewed with `chezmoi diff` before it enters the repo.

## What's tracked

| Source | Installs to | Notes |
|---|---|---|
| `home/dot_zshrc.tmpl` | `~/.zshrc` | templated: `brewPrefix`, home dir |
| `home/private_dot_gitconfig.tmpl` | `~/.gitconfig` | templated: identity, signers path; mode 0600 |
| `home/dot_p10k.zsh` | `~/.p10k.zsh` | plain, so `p10k configure` round-trips |
| `home/dot_zsh_plugins.txt` | `~/.zsh_plugins.txt` | antidote bundle list |
| `home/dot_gitignore` | `~/.gitignore` | global ignore (`core.excludesfile`) |
| `home/dot_finicky.js` | `~/.finicky.js` | browser router; **only where Finicky.app exists** |

Never tracked, by `home/.chezmoiignore`: `~/.secret` (live credentials),
`~/.zsh_plugins.zsh` (generated from the bundle list on first shell start),
and `*.zwc`.

`.finicky.js` is tracked but **conditionally applied**. Finicky is a GUI browser
router, so on a machine without it the config is dead weight. `home/.chezmoiignore`
is a template and ignores the file when `/Applications/Finicky.app` is absent:

```
{{ if not (stat "/Applications/Finicky.app") -}}
.finicky.js
{{ end -}}
```

This keys off the filesystem rather than a config variable, so no machine needs a
new prompt or a `chezmoi init` re-run — a Finicky machine renders exactly the rule
set it did before. Check with `chezmoi ignored` and `chezmoi managed`. Note this
only stops chezmoi *managing* the file; an existing `~/.finicky.js` is left on disk
untouched, not deleted.

## New machine

```sh
brew install chezmoi antidote git-delta difftastic
chezmoi init --apply --source=~/repos/pqrth/dotfiles \
  git@github.com:pqrth/dotfiles.git
git -C ~/repos/pqrth/dotfiles config core.hooksPath hooks
```

`init` prompts for git name, email and SSH signing key. The answers land in
`~/.config/chezmoi/chezmoi.toml` — **outside the repo**, which is why the
identity is never committed. `brewPrefix` is derived from the architecture
(`/opt/homebrew` on Apple silicon, `/usr/local` on Intel), not prompted.

To answer without a TTY, note that `--promptString` is keyed by the *prompt
text*, not the variable name:

```sh
chezmoi init --source=~/repos/pqrth/dotfiles \
  --promptString 'Git author name=Ada Lovelace' \
  --promptString 'Git author email=ada@example.com' \
  --promptString 'SSH signing key (public key line)=ssh-ed25519 AAAA...'
```

Two things `chezmoi apply` does not install: `~/.secret`, and
`~/.ssh/allowed_signers` (referenced by `.gitconfig`; commit verification is
inert until it exists).

## Daily loops

**Absorb a change made on the machine.** For a *plain* tracked file — after
`p10k configure`, or an edit to `~/.zsh_plugins.txt`, `~/.gitignore`,
`~/.finicky.js`:

```sh
chezmoi re-add          # pull live files back into home/
git -C ~/repos/pqrth/dotfiles diff      # review; chezmoi diff is empty by now
git -C ~/repos/pqrth/dotfiles commit -am "..." && git push
```

**`re-add` does not absorb the two templated files.** chezmoi refuses to
overwrite a template, and it does so *silently* — `chezmoi re-add` exits 0 and
says nothing, so an edit made directly to `~/.zshrc` or `~/.gitconfig` looks
absorbed but is not. Those two are edited at the source instead:

```sh
$EDITOR home/dot_zshrc.tmpl             # or home/private_dot_gitconfig.tmpl
chezmoi diff && chezmoi apply
```

If you have already edited `~/.zshrc` in place, `chezmoi diff` shows the drift
in reverse (source → live); port the change into the template by hand, then
`chezmoi apply` to reconcile.

**Push a change out from the repo.** Edit under `home/`, then:

```sh
chezmoi diff            # what would change in $HOME
chezmoi apply
```

**Add a new file.** `chezmoi add ~/.foo`, then commit.

## Gotchas

- **`p10k configure` regenerates `~/.p10k.zsh` from scratch** and will drop the
  hand edits in the `context` section (the segment is hidden in a plain local
  shell but shown under sudo). `chezmoi diff` surfaces the loss before it can be
  committed — look at it before running `re-add`.
- **`chezmoi re-add` skips templates silently** (exit 0, no message), so
  `~/.zshrc` and `~/.gitconfig` edits made in place are not picked up. Edit
  `home/dot_zshrc.tmpl` / `home/private_dot_gitconfig.tmpl` instead.
- **`diff.external = difft`** is set globally, so plain `git diff` emits
  difftastic output. Anything parsing diff text needs `--no-ext-diff`;
  `hooks/pre-commit` does.
- **`brew --prefix <formula>` does not fail on an uninstalled formula.** For any
  formula Homebrew *knows*, it prints `<prefix>/opt/<name>` and exits 0 whether or
  not it is installed; only an unknown name exits 1. So `.zshrc`'s `brew --prefix`
  calls print no errors on a machine missing npm/sqlite/erlang/zsh-completions —
  the only effect is a non-existent directory on `MANPATH` (erlang) and a no-op at
  the `zsh-completions` block, which is already `[[ -d ]]`-guarded.
- **`antidote` is a hard dependency of `.zshrc`.** Unlike the `brew --prefix`
  lines, `source .../antidote.zsh` at line 92 errors on every shell start if the
  formula is missing, and `~/.zsh_plugins.zsh` never gets generated. `delta` and
  `difftastic` are likewise hard dependencies of `.gitconfig`'s `core.pager` and
  `diff.external`. A new machine needs:
  `brew install antidote git-delta difftastic`.
- **`hooks/pre-commit` is not enabled by cloning.** Run the
  `git config core.hooksPath hooks` line above.
