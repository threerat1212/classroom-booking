param(
    [string]$EnvPath = ".env",
    [string]$Message = "Reply briefly that the classroom AI tutor is ready.",
    [string]$Model,
    [string]$BaseUrl
)

function Read-DotEnvValue {
    param([string]$Path, [string]$Name)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $null
    }

    $line = Get-Content -LiteralPath $Path |
        Where-Object { $_ -match "^\s*$Name\s*=" } |
        Select-Object -First 1

    if (-not $line) {
        return $null
    }

    return (($line -replace "^\s*$Name\s*=\s*", "").Trim().Trim('"').Trim("'"))
}

$apiKey = $env:AI_API_KEY
if (-not $apiKey) {
    $apiKey = Read-DotEnvValue -Path $EnvPath -Name "AI_API_KEY"
}

if (-not $apiKey) {
    $legacyKey = Read-DotEnvValue -Path $EnvPath -Name "GLM_API_KEY"
    if ($legacyKey) {
        $apiKey = $legacyKey
    }
}

if (-not $apiKey) {
    Write-Host "FAILED: AI_API_KEY is missing. Add it to .env or set the environment variable." -ForegroundColor Red
    exit 1
}

if (-not $BaseUrl) {
    $BaseUrl = $env:AI_BASE_URL
}
if (-not $BaseUrl) {
    $BaseUrl = Read-DotEnvValue -Path $EnvPath -Name "AI_BASE_URL"
}
if (-not $BaseUrl) {
    $BaseUrl = "https://openrouter.ai/api/v1/chat/completions"
}

if (-not $Model) {
    $Model = $env:AI_MODEL
}
if (-not $Model) {
    $Model = Read-DotEnvValue -Path $EnvPath -Name "AI_MODEL"
}
if (-not $Model) {
    $Model = "z-ai/glm-4.5-air:free"
}

$appName = Read-DotEnvValue -Path $EnvPath -Name "AI_APP_NAME"
if (-not $appName) {
    $appName = "Classroom MS AI Tutor"
}

$siteUrl = Read-DotEnvValue -Path $EnvPath -Name "AI_SITE_URL"
if (-not $siteUrl) {
    $siteUrl = "http://localhost:3000"
}

$body = @{
    model = $Model
    messages = @(
        @{ role = "system"; content = "You are a helpful classroom AI tutor. Reply concisely." },
        @{ role = "user"; content = $Message }
    )
} | ConvertTo-Json -Depth 5

Write-Host "Testing AI provider..." -ForegroundColor Cyan
Write-Host "Endpoint: $BaseUrl" -ForegroundColor DarkCyan
Write-Host "Model: $Model" -ForegroundColor DarkCyan

try {
    Add-Type -AssemblyName System.Net.Http
    $client = [System.Net.Http.HttpClient]::new()
    $client.Timeout = [TimeSpan]::FromSeconds(45)
    $client.DefaultRequestHeaders.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $apiKey)
    $client.DefaultRequestHeaders.Add("HTTP-Referer", $siteUrl)
    $client.DefaultRequestHeaders.Add("X-Title", $appName)

    $content = [System.Net.Http.StringContent]::new($body, [System.Text.Encoding]::UTF8, "application/json")
    $res = $client.PostAsync($BaseUrl, $content).GetAwaiter().GetResult()
    $resBody = $res.Content.ReadAsStringAsync().GetAwaiter().GetResult()

    if (-not $res.IsSuccessStatusCode) {
        Write-Host "FAILED! Status: $([int]$res.StatusCode)" -ForegroundColor Red
        Write-Host "Response: $resBody" -ForegroundColor Red
        exit 1
    }

    $json = $resBody | ConvertFrom-Json
    Write-Host "SUCCESS! Status: $([int]$res.StatusCode)" -ForegroundColor Green
    Write-Host "AI Response: $($json.choices[0].message.content)" -ForegroundColor Green
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    $response = $null
    try {
        $response = $_.Exception.Response
    } catch {
        $response = $null
    }
    if ($null -ne $response) {
        try {
            $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
            $errBody = $reader.ReadToEnd()
            Write-Host "Response: $errBody" -ForegroundColor Red
        } catch {
            Write-Host "Response body unavailable." -ForegroundColor Red
        }
    }
    exit 1
}
