# Deployment Workflow

## Overview

This project uses a **pre-push Git hook** to automatically generate the `public/projects` folder before pushing to GitHub. This ensures that GitHub Actions can build the site without needing access to local project files.

## How It Works

1. **Local Development**: Run `npm run dev` which runs the pre-build script and starts Next.js dev server
2. **Pre-Push Hook**: When you push to GitHub, the hook automatically:
   - Runs `npm run prebuild` to generate `public/projects` folder
   - Processes all project files from `/Users/zacharysturman/Desktop/PORTFOLIO`
   - Warns you if there are uncommitted changes in `public/projects`
3. **GitHub Actions**: Simply runs `npm run build` (which is just `next build`) on the pre-processed files

## Commands

- `npm run dev` - Run pre-build script + start development server
- `npm run build` - Build for production (CI/CD uses this)
- `npm run prebuild` - Manually run the pre-build script
- `npm start` - Start production server
- `npm run lint` - Run linting

## Pre-Push Hook

Located at `.git/hooks/pre-push`, this hook:
- Runs before every `git push`
- Executes the pre-build script automatically
- Checks for uncommitted changes in `public/projects`
- Prompts you to commit changes before pushing if needed

**Important**: The `public/projects` folder should be committed to the repository so GitHub Actions has the processed files.

## Manual Pre-Build

If you need to run the pre-build script manually:

```bash
npm run prebuild
```

## Troubleshooting

### Pre-push hook not running
- Ensure the hook is executable: `chmod +x .git/hooks/pre-push`
- Check that you're in the correct directory when pushing

### GitHub Actions build failing
- Ensure `public/projects` folder is committed and pushed
- Check that the build script doesn't reference local paths
- Verify `package.json` build script is just `next build`

### Hook prompting for uncommitted changes
- Run `git status` to see what changed in `public/projects`
- Commit the changes: `git add public/projects && git commit -m "Update project assets"`
- Push again

## Bypassing the Hook

If you absolutely need to push without running the pre-build (not recommended):

```bash
git push --no-verify
```
