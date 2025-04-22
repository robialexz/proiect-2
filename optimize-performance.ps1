Write-Host "Începe optimizarea performanței aplicației..." -ForegroundColor Green

# 1. Actualizează browserslist pentru performanță optimă
Write-Host "Actualizare browserslist..." -ForegroundColor Cyan
npx update-browserslist-db@latest

# 2. Elimină importurile duplicate de Sidebar din toate paginile
Write-Host "Eliminare importuri duplicate Sidebar..." -ForegroundColor Cyan
$files = Get-ChildItem -Path "src/pages" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Verifică dacă fișierul importă Sidebar
    if ($content -match 'import Sidebar from "@/components/layout/Sidebar";') {
        # Elimină importul Sidebar
        $newContent = $content -replace 'import Sidebar from "@/components/layout/Sidebar";[\r\n]*', ''
        
        # Verifică dacă fișierul conține componenta Sidebar
        if ($newContent -match '<Sidebar\s*/>') {
            # Elimină componenta Sidebar
            $newContent = $newContent -replace '<Sidebar\s*/>', ''
        }
        
        # Scrie conținutul actualizat înapoi în fișier
        Set-Content -Path $file.FullName -Value $newContent
        
        Write-Host "  Actualizat $($file.Name)" -ForegroundColor Gray
    }
}

# 3. Verifică și corectează fișierul i18n.ts pentru a elimina duplicate
Write-Host "Verificare și corectare fișier i18n.ts..." -ForegroundColor Cyan
$i18nPath = "src/i18n.ts"
$i18nContent = Get-Content -Path $i18nPath -Raw

# Verifică dacă există duplicate pentru limba română
if ($i18nContent -match 'ro: \{\s*translation: \{[^}]*\}\s*\},[^}]*ro: \{') {
    Write-Host "  S-au găsit duplicate pentru limba română. Se corectează..." -ForegroundColor Yellow
    
    # Implementează logica de corectare aici
    # Acest lucru ar trebui făcut manual pentru a evita probleme
    Write-Host "  Corectarea trebuie făcută manual. Verificați fișierul i18n.ts" -ForegroundColor Red
}

# 4. Verifică dacă există erori în consolă
Write-Host "Verificare erori în consolă..." -ForegroundColor Cyan
$npmLintCommand = "npm run lint"
Invoke-Expression $npmLintCommand

Write-Host "Optimizare completă!" -ForegroundColor Green
Write-Host "Rulați 'npm run dev' pentru a testa aplicația optimizată." -ForegroundColor Green
