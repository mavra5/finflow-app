#!/bin/bash
# FinFlow auto-deploy watcher — jalankan sekali: bash autosync.sh
# Memantau folder ini; tiap ada perubahan -> commit + push -> Netlify auto-deploy.
cd "$(dirname "$0")" || exit 1
echo "FinFlow auto-sync aktif. Memantau perubahan… (Ctrl+C untuk berhenti)"
while true; do
  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "auto: update $(date '+%Y-%m-%d %H:%M:%S')" >/dev/null 2>&1
    if git push >/dev/null 2>&1; then
      echo "$(date '+%H:%M:%S')  ✓ ter-push → Netlify sedang deploy"
    else
      echo "$(date '+%H:%M:%S')  ! push gagal (cek koneksi/remote)"
    fi
  fi
  sleep 8
done
