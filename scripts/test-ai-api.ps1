# Test Z.AI API with glm-5.1
# Usage: .\scripts\test-ai-api.ps1 -ApiKey "your-api-key"
param([string]$ApiKey)

if (-not $ApiKey) {
    Write-Host "Usage: .\scripts\test-ai-api.ps1 -ApiKey 'your-zai-api-key'"
    exit 1
}

$body = @{
    model = "glm-5.1"
    messages = @(
        @{ role = "system"; content = "You are a helpful AI tutor." },
        @{ role = "user"; content = "สวัสดี แนะนำตัวเองหน่อย" }
    )
} | ConvertTo-Json -Depth 5

Write-Host "Testing Z.AI API (api.z.ai) with model glm-5.1..." -ForegroundColor Cyan

try {
    $res = Invoke-WebRequest -Uri "https://api.z.ai/api/paas/v4/chat/completions" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $ApiKey"
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -TimeoutSec 30

    $json = $res.Content | ConvertFrom-Json
    Write-Host "SUCCESS! Status: $($res.StatusCode)" -ForegroundColor Green
    Write-Host "AI Response: $($json.choices[0].message.content)" -ForegroundColor Green
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        Write-Host "Response: $errBody" -ForegroundColor Red
    }
}
