# 🚑 Fix for Google Apps Script Syntax Error

## The Problem
You're seeing: `Syntax error: SyntaxError: Invalid or unexpected token line: 1`

This happens when extra characters get copied along with the code.

## The Solution

### Method 1: Use the Terminal (100% Reliable)
1. In VS Code, open the terminal (View → Terminal)
2. Run this command:
   ```bash
   cd /workspaces/clearhive-scheduler-api
   cat examples/APPsCode.md | pbcopy
   ```
   (On Windows, use: `cat examples/APPsCode.md | clip`)
3. The code is now in your clipboard - paste into Google Apps Script

### Method 2: Check What You're Copying
The FIRST line of code should be exactly:
```
/************************************************************
```

NOT:
- `# APPsCode.md`
- ````markdown`
- `1  /************************************************************` (with line numbers)
- Any HTML tags

### Method 3: Create a Clean File
1. In VS Code terminal:
   ```bash
   cp examples/APPsCode.md APPsCode_CLEAN.js
   ```
2. Open `APPsCode_CLEAN.js`
3. Copy all content from this file

## Verify Your Copy
After pasting in Google Apps Script:
1. The first character should be `/`
2. Line 1 should start with `/****`
3. You should have exactly 9,832 lines

## Still Having Issues?
The file might be too large for your browser. Try copying in chunks:
- Lines 1-3000
- Lines 3001-6000  
- Lines 6001-9832

Each chunk should paste without errors.
