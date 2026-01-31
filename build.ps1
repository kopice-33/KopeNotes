# build.ps1
# taskkill /F /IM electron.exe 2>$null
# taskkill /F /IM node.exe 2>$null
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*KopeNotes*" } | Stop-Process -Force
Remove-Item -Path "dist", "dist-react" -Recurse -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
npm run build
npx electron-builder --win --x64