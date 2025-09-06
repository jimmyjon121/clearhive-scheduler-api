# 🚀 Family First Scheduler - What You Actually Need

## 📄 The ONLY File That Matters

**`APPsCode.gs`** - This is your complete Google Apps Script code (10,229 lines)
- Copy ALL of this code
- Paste it into your Google Apps Script editor
- Save and you're done!

## 🗑️ Everything Else Can Be Ignored

All the other files in the `examples/` folder are:
- Development notes
- Test files  
- Documentation
- Old versions
- Examples

**You DON'T need them to run your scheduler!**

## ✅ Simple Setup Steps

1. **Open your Google Sheet**
2. **Extensions → Apps Script**
3. **Delete any existing code in the editor**
4. **Copy the ENTIRE content from `APPsCode.gs`**
   - Start from the very first line: `/************************************************************`
   - Copy all the way to the last line (around line 10,229)
   - Make sure to get EVERYTHING
5. **Paste into Apps Script editor**
   - The code should start with `/************************************************************`
   - If it starts with ````markdown` or anything else, you copied wrong
6. **Click Save (💾)** or press Ctrl+S / Cmd+S
7. **Close Apps Script and refresh your Google Sheet**
8. **Look for the new "Scheduler Menu" in your sheet's menu bar**

## ⚠️ Common Copy/Paste Mistakes

- **DON'T** copy from the GitHub preview (it adds formatting)
- **DO** click on the file and use "Raw" view, OR
- **DO** open the file in VS Code and copy from there
- Make sure the first line is the comment starting with `/****`
- Make sure you get ALL 10,229 lines!

## 🚑 Fix for "Syntax error: Invalid or unexpected token"

This error means the copy/paste didn't work correctly. Here's how to fix it:

### Option 1: Use Raw View (Recommended)
1. In VS Code, open `APPsCode.gs`
2. Click the "Open Preview to the Side" button (top right)
3. In the preview, right-click and select "Open in Browser"
4. Click "Raw" button on GitHub
5. Select all (Ctrl+A), copy (Ctrl+C)
6. Paste into Google Apps Script

### Option 2: Direct Copy from VS Code
1. Open `examples/APPsCode.md` in VS Code
2. Look at the very first line - it should show:
   ```
   /************************************************************
   ```
3. If you see ````markdown` at the top, you're in the wrong view
4. Make sure you're in the SOURCE view, not preview
5. Select ALL text and copy

### Option 3: Command Line (Most Reliable)
1. In VS Code terminal:
   ```bash
   cat examples/APPsCode.md > clean_code.txt
   ```
2. Open `clean_code.txt`
3. Copy all content from there

## 🎯 What Your System Does

Your complete therapeutic outings scheduler includes:
- **Schedule Generation**: Smart vendor rotation and assignment
- **Email System**: Sends to 200+ recipients with duplicate prevention
- **Color Coding**: Visual consistency between sheets and emails
- **Calendar Integration**: Syncs with vendor Google Calendars
- **PDF Generation**: Creates branded schedules for vendors
- **Outing Replacement**: Handle cancellations easily
- **Vendor Management**: Track calendar IDs and contact info

## ⚠️ Don't Get Confused By:

- Multiple `.js` files - These were just examples/tests
- `.md` documentation files - Just development notes
- HTML files - Not needed for Google Sheets
- Review/analysis files - Just planning documents

## 💡 Remember

**One file (`APPsCode.md`) = Your entire system!**

Everything is self-contained in that single Apps Script file. All the menus, functions, and features are included.

---

*Last updated: September 4, 2025*
