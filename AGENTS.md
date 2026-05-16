# Repository Instructions

## Local Config Safety

- Never modify `.env`, `.env.local`, `.env.*`, or any local machine-specific config files unless the user explicitly asks for that exact change.
- You may update `.env.example` to document required variables.
- If a task requires environment changes, explain what the user should add or change instead of editing the real env file.
- Treat secrets, tokens, local credentials, and developer-specific settings as user-owned configuration.

## Protected Files

The following files are user-owned and must not be edited unless explicitly requested:

- `.env`
- `.env.local`
- `.env.*`
- credential files
- local-only config files
