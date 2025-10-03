# 📤 GitHub Upload Guide - TinyPay

## 🎯 **Files to Upload**

### ✅ **Essential Files (MUST UPLOAD)**

#### **1. Smart Contract**
```
move_contracts/
├── Move.toml
└── sources/
    └── tinypay.move
```

#### **2. Backend Code**
```
backend/
├── package.json
├── tsconfig.json
└── src/
    ├── config.ts
    ├── api_server.ts
    └── deploy.ts
```

#### **3. Frontend Code**
```
frontend/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.tsx
    ├── App.css
    ├── index.css
    ├── vite-env.d.ts
    ├── App_Story.tsx
    └── components/
        └── NodeBox.tsx
```

#### **4. Documentation**
```
README.md
LICENSE
DEPLOYMENT_INFO.md
QUICKSTART.md
INTERACTIVE_DEMO_GUIDE.md
VIDEO_DEMO_SCRIPT.md
HACKATHON_SUBMISSION.md
```

#### **5. Configuration Files**
```
.gitignore
deployment.json
package.json (root)
```

---

## ❌ **Files to EXCLUDE (Already in .gitignore)**

```
node_modules/
backend/node_modules/
frontend/node_modules/
frontend/dist/
backend/.env
move_contracts/build/
.DS_Store
*.log
```

---

## 🚀 **Step-by-Step Upload Instructions**

### **Step 1: Initialize Git Repository**

```bash
# Navigate to your project
cd D:\TinyPay

# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/MrTimonM/TInyPay.git
```

### **Step 2: Add Files**

```bash
# Add all essential files (gitignore will exclude unwanted files)
git add .
```

### **Step 3: Commit**

```bash
git commit -m "Initial commit: TinyPay - Offline-First Crypto Payments on Aptos

- Move smart contract with double-spend prevention
- Node.js backend API server
- React frontend with interactive demo
- Comprehensive documentation
- Deployment on Aptos Devnet
- Built for CTRL+MOVE Hackathon"
```

### **Step 4: Push to GitHub**

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

---

## 📋 **Quick Command Sequence**

Copy and paste this entire sequence:

```bash
cd D:\TinyPay
git init
git remote add origin https://github.com/MrTimonM/TInyPay.git
git add .
git commit -m "Initial commit: TinyPay - Offline-First Crypto Payments on Aptos"
git branch -M main
git push -u origin main
```

---

## 🔍 **Verify What Will Be Uploaded**

Before pushing, check what files will be uploaded:

```bash
# See all staged files
git status

# See what will be uploaded (excluding gitignore)
git ls-files
```

---

## 📦 **Repository Structure After Upload**

```
TinyPay/
├── 📄 README.md (Main project overview)
├── 📄 LICENSE (MIT License)
├── 📄 DEPLOYMENT_INFO.md (Deployment details)
├── 📄 HACKATHON_SUBMISSION.md (Hackathon submission)
├── 📄 INTERACTIVE_DEMO_GUIDE.md (Demo instructions)
├── 📄 VIDEO_DEMO_SCRIPT.md (Video script)
├── 📄 QUICKSTART.md (Quick start guide)
├── 📄 package.json (Root package file)
├── 📄 deployment.json (Deployment addresses)
├── 📄 .gitignore (Git ignore rules)
│
├── 📁 move_contracts/ (Smart Contract)
│   ├── Move.toml
│   └── sources/
│       └── tinypay.move
│
├── 📁 backend/ (Node.js Backend)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── config.ts
│       ├── api_server.ts
│       └── deploy.ts
│
└── 📁 frontend/ (React Frontend)
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App_Story.tsx
        ├── App.css
        ├── index.css
        └── components/
            └── NodeBox.tsx
```

---

## 🎨 **GitHub Repository Settings (After Upload)**

### **1. Add Repository Description**
```
🚀 TinyPay - Offline-First Crypto Payments on Aptos | Enabling 2.6B people to access crypto without internet | Built for CTRL+MOVE Hackathon
```

### **2. Add Topics/Tags**
```
aptos, blockchain, cryptocurrency, offline-payments, move-language, 
hackathon, defi, financial-inclusion, smart-contracts, typescript, react
```

### **3. Update Repository Details**
- ✅ Website: Add your deployed frontend URL (if hosted)
- ✅ Check "Include in the README"

---

## 🔐 **Security Notes**

**IMPORTANT**: Make sure `.env` files are NOT uploaded!

Check your `.gitignore` includes:
```
.env
*.env
backend/.env
```

**Never commit**:
- ❌ Private keys
- ❌ API secrets
- ❌ Environment variables with sensitive data

---

## 🐛 **Troubleshooting**

### **Issue: "repository not found"**
```bash
# Make sure you're authenticated with GitHub
git remote -v
# Should show: https://github.com/MrTimonM/TInyPay.git
```

### **Issue: "failed to push"**
```bash
# Pull first if remote has README
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### **Issue: "large files"**
```bash
# Check file sizes
git ls-files -z | xargs -0 du -h | sort -h | tail -20
# Remove large files from git
git rm --cached <large-file>
```

---

## ✅ **Post-Upload Checklist**

After uploading:

- [ ] Check repository on GitHub: https://github.com/MrTimonM/TInyPay
- [ ] Verify README.md displays correctly
- [ ] Confirm no .env or private keys are visible
- [ ] Add repository description and topics
- [ ] Create releases/tags for hackathon submission
- [ ] Add GitHub Pages for frontend (optional)

---

## 🏆 **Hackathon Submission**

Your repository is now ready for:
- ✅ DoraHacks submission (link to GitHub repo)
- ✅ Judge review (clean, documented code)
- ✅ Public showcase (professional presentation)

---

## 📞 **Need Help?**

If you encounter issues:
1. Check git status: `git status`
2. Check remote: `git remote -v`
3. Verify .gitignore is working: `git check-ignore -v <filename>`

---

**You're ready to upload! Execute the commands and your project will be live on GitHub! 🚀**
