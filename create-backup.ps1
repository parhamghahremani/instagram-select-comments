$source = 'D:\Desktop\project\scripts\instagram-select-comments'
$dest = 'D:\Desktop\project\scripts\instagram-select-comments\backups\full-snapshots\instagram-select-comments-20261117-initial-v5.1.0.zip'
$excludePatterns = @('backups\*', 'node_modules\*', 'dist\*', 'versions\*', 'test-results\*', 'playwright-report\*', '.git\*', '*.log', '.env*')

$files = Get-ChildItem -Path $source -Recurse -File | Where-Object {
    $rel = $_.FullName.Substring($source.Length + 1)
    $excluded = $false
    foreach ($pattern in $excludePatterns) {
        if ($rel -like $pattern) {
            $excluded = $true
            break
        }
    }
    -not $excluded
}

$files | Compress-Archive -DestinationPath $dest -Force
Write-Host "Created: $dest"
Write-Host "Files: $($files.Count)"