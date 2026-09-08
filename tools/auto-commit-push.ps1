param(
    [int]$DebounceSeconds = 3
)

$ErrorActionPreference = 'Stop'
$repoRoot = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0) {
    throw 'Run this script from inside the Git repository.'
}

Set-Location $repoRoot
$watcher = [System.IO.FileSystemWatcher]::new($repoRoot)
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, Size, DirectoryName'

$pending = $false
$lastChange = [datetime]::MinValue
$eventHandler = {
    if ($Event.SourceEventArgs.FullPath -notmatch '\\.git(\\|$)') {
        $script:pending = $true
        $script:lastChange = Get-Date
    }
}

Register-ObjectEvent $watcher Changed -Action $eventHandler | Out-Null
Register-ObjectEvent $watcher Created -Action $eventHandler | Out-Null
Register-ObjectEvent $watcher Deleted -Action $eventHandler | Out-Null
Register-ObjectEvent $watcher Renamed -Action $eventHandler | Out-Null

Write-Host "Watching $repoRoot. Press Ctrl+C to stop."
try {
    while ($true) {
        Start-Sleep -Milliseconds 500
        if (-not $pending -or ((Get-Date) - $lastChange).TotalSeconds -lt $DebounceSeconds) {
            continue
        }

        $pending = $false
        $changes = git status --porcelain
        if (-not $changes) {
            continue
        }

        git add --all
        if (git diff --cached --quiet) {
            continue
        }

        $message = "chore: auto-save $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git commit -m $message
        if ($LASTEXITCODE -ne 0) {
            Write-Warning 'Commit gagal. Periksa hook atau validasi Git.'
            continue
        }

        git push origin HEAD
        if ($LASTEXITCODE -ne 0) {
            Write-Warning 'Commit berhasil, tetapi push gagal. Jalankan git push setelah koneksi atau kredensial tersedia.'
        }
    }
}
finally {
    $watcher.Dispose()
    Get-EventSubscriber | Where-Object SourceObject -eq $watcher | Unregister-Event
}