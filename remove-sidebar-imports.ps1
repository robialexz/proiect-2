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
        
        Write-Host "Actualizat $($file.Name)"
    }
}

Write-Host "Toate fișierele au fost actualizate cu succes!"
