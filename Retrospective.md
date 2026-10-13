# Retrospective

Accident narratives for this repo.

Routing: narrative stays here. A project-specific rule that will recur may become one line in `AGENTS.md`. Cross-project lessons go to nmem or a global rule. If it can be checked by a machine, add a hook or test instead of prose.

## 2026-10-13: Reinstall local-file examples from a clean directory

During the Next.js 16.3.8 release, incremental Bun installs failed with ENOENT
while copying the local `@nocoo/next-ai` package. Retrying with the copyfile
backend failed as well. Moving the owned example's generated `node_modules`
aside and performing a fresh frozen install succeeded for the Next.js example.
Preserve existing backups, use a new owned path for each attempt, and do not
mistake a partially populated directory for a successful install. Registry
normalization must also handle redirected tarball hosts without changing
package versions or integrity hashes.
