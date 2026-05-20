# GitHub Upload Guide

Repository:

```text
https://github.com/MoonQuietColor/personal-decision-sandbox-agent.git
```

## Upload with GitHub web UI

1. Open the repository page.
2. Click **Add file** → **Upload files**.
3. Upload all files from this project folder, including `.github/workflows/pages.yml`.
4. Commit directly to `main`.
5. Go to **Settings** → **Pages**.
6. Set Source to **GitHub Actions**.
7. Wait for the deployment workflow to finish.

## Upload with Git command line

```bash
git clone https://github.com/MoonQuietColor/personal-decision-sandbox-agent.git
cd personal-decision-sandbox-agent
# copy all project files into this folder
git add .
git commit -m "Initial release: Personal Decision Sandbox Agent"
git push origin main
```

Deployment URL:

```text
https://moonquietcolor.github.io/personal-decision-sandbox-agent/
```
