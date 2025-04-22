$files = Get-ChildItem -Path "src/pages" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace import statement
    $newContent = $content -replace 'import Navbar from "@/components/layout/Navbar";', 'import ModernNavbar from "@/components/layout/ModernNavbar";'
    
    # Replace component usage
    $newContent = $newContent -replace '<Navbar(\s+[^>]*>)', '<ModernNavbar$1'
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $newContent
    
    Write-Host "Updated $($file.Name)"
}

Write-Host "All files updated successfully!"
