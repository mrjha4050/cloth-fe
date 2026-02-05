# Add Node.js (Volta), Git, GitHub CLI, and Google Cloud SDK to PATH for this session.
# Run: . .\fix-path.ps1
# Or to set permanently: run this once, then in System Properties > Environment Variables
# add "C:\Program Files\Volta" to your User PATH.

$volta = "C:\Program Files\Volta"
$git = "C:\Program Files\Git\cmd"
$gh = "C:\Program Files\GitHub CLI"
$gcloud = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin"

$addToPath = @($volta, $git, $gh, $gcloud) | Where-Object { Test-Path $_ }
$env:PATH = ($addToPath + $env:PATH -split ";" | Select-Object -Unique) -join ";"

Write-Host "PATH updated. Checking npm..." -ForegroundColor Green
& "$volta\npm.cmd" --version
