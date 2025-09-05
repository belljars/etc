# Free Obsidian Sync with Git on Linux

A simple guide to sync your Obsidian vault across devices using GitHub, completely free, because we won't be shackled by Notion anymore.

## Initial Setup

Install required packages (in Arch Linux for an example):
```bash
sudo pacman -S git github-cli
```

Configure git:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## Create Your Obsidian Vault Repository

Navigate to your Obsidian vault folder:
```bash
cd ~/Documents/ObsidianVault  # or wherever your vault is
```

Initialize git and make first commit:
```bash
git init
git add .
git commit -m "Initial vault commit"
```

Login to GitHub CLI and create private repo (preferably for any private information):
```bash
gh auth login
gh repo create my-obsidian-vault --private --source=. --remote=origin --push
```

## Create Sync Scripts

Create the sync script:
```bash
nano ~/.local/bin/obsidian-sync
```

Paste this:
```bash
#!/bin/bash
VAULT_PATH="$HOME/Documents/ObsidianVault"  # Change to your vault path
cd "$VAULT_PATH" || exit 1
echo "Syncing vault..."
git fetch origin
git pull origin main
echo "✓ Vault synced"
```

Create the push script:
```bash
nano ~/.local/bin/obsidian-push
```

Paste this:
```bash
#!/bin/bash
VAULT_PATH="$HOME/Documents/ObsidianVault"  # Change to your vault path
cd "$VAULT_PATH" || exit 1

if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to push"
    exit 0
fi

git add .
git commit -m "Vault update $(date '+%Y-%m-%d %H:%M')"
git push origin main
echo "✓ Changes pushed"
```

Make scripts executable:
```bash
chmod +x ~/.local/bin/obsidian-sync
chmod +x ~/.local/bin/obsidian-push
```

## Add .gitignore for Obsidian

Create gitignore in your vault:
```bash
nano ~/Documents/ObsidianVault/.gitignore
```

Add these lines:
```
.obsidian/workspace*
.obsidian/cache
.trash/
.DS_Store
```

Commit the gitignore:
```bash
git add .gitignore
git commit -m "Add gitignore"
git push
```

## Daily Usage

Before starting work:
```bash
obsidian-sync
```

After making changes:
```bash
obsidian-push
```

## Setup on Another Computer

Clone your vault:
```bash
gh repo clone your-username/my-obsidian-vault ~/Documents/ObsidianVault
```

Copy the same sync scripts to the new computer and you're done.

## Optional: Auto-sync

Add to crontab for hourly auto-push:
```bash
crontab -e
```

Add this line:
```
0 * * * * /home/your-username/.local/bin/obsidian-push >/dev/null 2>&1
```

## Mobile Sync

For Android, use MGit or Termux with git. For iOS, use Working Copy. Clone the same repository and manually sync when needed.

## Tips

- Always sync before starting work to avoid conflicts
- Push changes before switching devices
- Keep commits frequent and small
- The vault works offline, git is just for syncing

That's it. Free Obsidian sync across all your devices using git.
