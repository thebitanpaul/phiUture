#!/usr/bin/env bash
# ============================================================================
# Edge rate limiting / abuse rules for phiuture.com
# ----------------------------------------------------------------------------
# WHY THIS EXISTS
#
# The in-function limiter (api/_rateLimit.js) protects the one route that costs
# money, but it can only run once a request has already reached the app. Static
# pages and assets never invoke a function at all, so nothing in this repo can
# throttle them. That has to happen at the edge, which is what these rules do.
#
# Vercel's platform DDoS mitigation (L3/L4/L7) is already on for every project
# on every plan with no configuration, and traffic it blocks is not billed.
# These WAF rules add the per-client throttling on top of it.
#
# HOW TO RUN
#
#   npm i -g vercel          # the CLI is not installed in this repo yet
#   vercel login
#   vercel link              # once, to associate this directory with the project
#   bash scripts/setup-firewall.sh
#
# Every rule is created in LOG mode and every change is STAGED, not live. The
# script deliberately does not publish — flipping rules straight to `deny` on a
# live site is how you find out that a condition also matched real visitors.
# Follow the staged rollout the script prints when it finishes.
#
# Re-running is safe in the sense that `rules add` will report a duplicate name
# rather than silently creating a second copy; use `vercel firewall rules edit`
# to change a rule that already exists.
# ============================================================================

set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "error: the Vercel CLI is not installed."
  echo "       npm i -g vercel"
  exit 1
fi

if [ ! -f .vercel/project.json ]; then
  echo "error: this directory is not linked to a Vercel project."
  echo "       vercel link"
  exit 1
fi

echo "==> Staging firewall rules (log mode, nothing enforced yet)"
echo

# ----------------------------------------------------------------------------
# 1. The content proxy. This is the only route that spends an invocation and an
#    upstream fetch, so it gets the tightest ceiling. A genuine visit makes 3
#    requests per session and the CDN absorbs repeats for 60s, so 120/min per IP
#    is orders of magnitude above real use — it only catches a loop.
# ----------------------------------------------------------------------------
echo "--> [1/3] rate limit /api"
vercel firewall rules add "Rate limit API" \
  --condition '{"type":"path","op":"pre","value":"/api"}' \
  --action rate_limit \
  --rate-limit-window 60 \
  --rate-limit-requests 120 \
  --rate-limit-keys ip \
  --rate-limit-action log \
  --yes

# ----------------------------------------------------------------------------
# 2. Site-wide flood ceiling. Generous on purpose: one page view is a document
#    plus a dozen assets, and a NAT'd office or mobile carrier shares one IP
#    across many people. 600/min per IP does not inconvenience a human but does
#    stop a single-host scraper or request flood.
#
#    Note the per-region counting: Vercel keeps these counters per edge region,
#    so a globally distributed client can exceed the number by roughly the
#    number of regions it reaches. That is what the platform DDoS layer and
#    Attack Challenge Mode are for.
# ----------------------------------------------------------------------------
echo "--> [2/3] site-wide flood ceiling"
vercel firewall rules add "Flood ceiling" \
  --condition '{"type":"path","op":"pre","value":"/"}' \
  --action rate_limit \
  --rate-limit-window 60 \
  --rate-limit-requests 600 \
  --rate-limit-keys ip \
  --rate-limit-action log \
  --yes

# ----------------------------------------------------------------------------
# 3. Exploit probes. Nothing here runs WordPress, PHP, or exposes a .env, so any
#    request for these paths is a scanner. Safe to flip to `deny` sooner than
#    the rate limits above, but still worth a day in log mode first to confirm.
# ----------------------------------------------------------------------------
echo "--> [3/3] exploit probe paths"
vercel firewall rules add "Block exploit probes" \
  --condition '{"type":"path","op":"inc","value":["/wp-admin","/wp-login.php","/xmlrpc.php","/.env","/.git/config","/phpmyadmin","/.aws/credentials","/config.json"]}' \
  --action log \
  --yes

echo
echo "==> Staged. Nothing is live yet."
echo
vercel firewall diff || true

cat <<'NEXT'

NEXT STEPS — roll these out in stages, not in one go:

  1. Publish them in log mode:

       vercel firewall publish --yes

  2. Let real traffic run for a day, then check what each rule matched:

       vercel firewall rules list --json      # copy the rule_… ids
       # open: https://vercel.com/<team>/<project>/firewall/traffic?filter=<ruleId>

     Confirm only the traffic you intended is matching — no real visitors, no
     Googlebot, no uptime monitor.

  3. Enforce, one rule at a time, starting with the probe blocker:

       vercel firewall rules edit "Block exploit probes" --action deny --yes
       vercel firewall rules edit "Rate limit API" --rate-limit-action rate_limit --yes
       vercel firewall rules edit "Flood ceiling"  --rate-limit-action rate_limit --yes
       vercel firewall publish --yes

     `rate_limit` returns 429 to clients over the limit. Use `challenge` instead
     of `deny` if you would rather give a human a way through.

  4. Keep this handy for the first 24h after enforcing — it reverts a rule
     without deleting it:

       vercel firewall rules disable "<name>" && vercel firewall publish --yes

DURING AN ACTIVE ATTACK, this is the switch (run it yourself — it challenges
every unverified visitor, so it is not something to automate):

       vercel firewall attack-mode enable --duration 1h

NEXT
