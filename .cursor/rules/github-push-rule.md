# Cursor Rule: GitHub Push Automation

When the user requests to push code to GitHub, always follow this process:

1. Stage all changes: `git add .`
2. Commit with a user-provided or default message: `git commit -m "<message>"`
3. Ensure the remote is set to the target repository (prompt user if not set)
4. Push to the main branch: `git push origin main`
5. Never push files listed in `.gitignore` (e.g., `.env.local`)
6. Report the result and any errors to the user
7. Always confirm the commit message with the user if not specified
8. If the user requests, allow them to review changes before pushing

**Security:**
- Never commit or push sensitive files that are in `.gitignore` or are known secrets.
- Always follow best practices for GitHub authentication and repository access. :D  