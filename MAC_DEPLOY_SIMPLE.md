https://github.com/jimmyjon121/clearhive-scheduler-api# 🍎 Mac Deployment - Super Simple Version

Since you don't have GitHub CLI installed, here's the easiest way:

## Option 1: Use GitHub Website (Easiest!)

### Step 1: Download the Project
1. Download the project archive that was created
2. Extract it on your Mac Desktop

### Step 2: Create GitHub Repository via Website
1. Go to: https://github.com/new
2. Repository name: `family-first-scheduler-api`
3. Make it Public
4. DON'T initialize with README
5. Click "Create repository"

### Step 3: Push Code Using Terminal
Open Terminal and run these commands:

```bash
cd ~/Desktop/clearhive-scheduler-api
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/family-first-scheduler-api.git
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password.

### Step 4: Deploy to Railway
1. Go to: https://railway.app
2. Sign in with GitHub
3. New Project → Deploy from GitHub repo → Select `family-first-scheduler-api`
4. Add Database → PostgreSQL
5. Settings → Generate Domain
6. Done! Your API is live!

---

## Option 2: Install GitHub CLI First (Better Long-term)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install GitHub CLI
brew install gh

# Login
gh auth login

# Then from your project folder:
gh repo create family-first-scheduler-api --public --source=. --push
```

---

## Option 3: Use GitHub Desktop (Visual)

1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. File → Add Local Repository → Choose your project folder
4. Publish repository
5. Then deploy to Railway as shown above

---

## Quick Test After Deployment

Once deployed to Railway, test it:

```bash
# Replace YOUR-APP with your Railway URL
curl https://YOUR-APP.railway.app/api/v1/health
```

Then open `quick-start.html` in your browser and enter your Railway URL!
