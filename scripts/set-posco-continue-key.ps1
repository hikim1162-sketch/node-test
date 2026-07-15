param(
    [Parameter(Mandatory = $true)]
    [string]$ApiKey,
    [string]$SystemCode = "hikim1114",
    [string]$CompanyCode = "02"
)

$auth = @{
    apiKey = $ApiKey
    systemCode = $SystemCode
    companyCode = $CompanyCode
} | ConvertTo-Json -Compress

$encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($auth))
[Environment]::SetEnvironmentVariable("POSCO_PGPT_AUTH_BASE64", $encoded, "User")
$env:POSCO_PGPT_AUTH_BASE64 = $encoded

Write-Host "P-GPT 인증 정보가 사용자 환경 변수에 저장되었습니다."
Write-Host "VS Code를 완전히 종료한 뒤 다시 실행하세요."

