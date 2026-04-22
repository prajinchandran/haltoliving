# Halto UI

React frontend for the Halto API.

## Setup (one time)

1. Extract this folder to:
   ```
   P:\Work Folder\My Projects\#Development\halto-ui
   ```

2. Open PowerShell in that folder:
   ```powershell
   cd "P:\Work Folder\My Projects\#Development\halto-ui"
   npm install
   ```

## Run

Make sure `halto.Api` is already running on port 5000, then:

```powershell
npm run dev
```

Open → http://localhost:3000

## Default login (from seeded data)

| Role  | Email                        | Password   |
|-------|------------------------------|------------|
| Owner | owner@greenvalley.local      | Owner@123  |
| Staff | staff1@greenvalley.local     | Staff@123  |
| Super | admin@halto.local            | Admin@123  |

## Production build

```powershell
npm run build
# Output in dist/ folder — deploy to Azure Static Web Apps or any host
```
