$BASE = "http://localhost:8080"

Write-Host "=== 1. POST /api/v1/auth/login (success) ==="
$login = Invoke-RestMethod -Uri "$BASE/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@school.edu","password":"admin123"}'
$TOKEN = $login.data.access_token
Write-Host "Token: $($TOKEN.Substring(0, [Math]::Min(20, $TOKEN.Length)))..."

Write-Host "`n=== 2. POST /api/v1/auth/login (failure) ==="
try {
    Invoke-RestMethod -Uri "$BASE/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"bad@school.edu","password":"wrong"}'
} catch {
    Write-Host $_.Exception.Message
}

Write-Host "`n=== 3. GET /api/v1/users (with auth) ==="
$users = Invoke-RestMethod -Uri "$BASE/api/v1/users" -Headers @{Authorization = "Bearer $TOKEN"}
Write-Host "Users count: $($users.data.Count)"

Write-Host "`n=== 4. GET /api/v1/users (without auth -> 401) ==="
try {
    Invoke-RestMethod -Uri "$BASE/api/v1/users"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n=== 5. CRUD /api/v1/rooms ==="
$roomCode = "TR" + (Get-Random -Maximum 99999)
$roomBody = "{`"name`":`"Test Room`",`"code`":`"$roomCode`",`"room_type`":`"classroom`",`"capacity`":30,`"floor`":1,`"building`":`"A`"}"
$room = Invoke-RestMethod -Uri "$BASE/api/v1/rooms" -Method POST -Headers @{Authorization = "Bearer $TOKEN"} -ContentType "application/json" -Body $roomBody
$ROOM = $room.data.id
Write-Host "Created room: $ROOM"
Invoke-RestMethod -Uri "$BASE/api/v1/rooms/$ROOM" -Headers @{Authorization = "Bearer $TOKEN"} | Select-Object -ExpandProperty data | Select-Object -ExpandProperty name
Invoke-RestMethod -Uri "$BASE/api/v1/rooms/$ROOM" -Method PUT -Headers @{Authorization = "Bearer $TOKEN"} -ContentType "application/json" -Body '{"name":"Updated Room","capacity":35}' | Select-Object -ExpandProperty data | Select-Object -ExpandProperty name
Invoke-RestMethod -Uri "$BASE/api/v1/rooms/$ROOM" -Method DELETE -Headers @{Authorization = "Bearer $TOKEN"} | Out-Null
Write-Host "DELETE completed"

Write-Host "`n=== 6. POST /api/v1/bookings (success) ==="
$room2Code = "BT" + (Get-Random -Maximum 99999)
$room2Body = "{`"name`":`"Booking Test`",`"code`":`"$room2Code`",`"room_type`":`"meeting_room`",`"capacity`":20,`"floor`":2,`"building`":`"B`"}"
$room2 = Invoke-RestMethod -Uri "$BASE/api/v1/rooms" -Method POST -Headers @{Authorization = "Bearer $TOKEN"} -ContentType "application/json" -Body $room2Body
$ROOM2 = $room2.data.id
$start = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
$end = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
$booking = Invoke-RestMethod -Uri "$BASE/api/v1/bookings" -Method POST -Headers @{Authorization = "Bearer $TOKEN"} -ContentType "application/json" -Body "{`"room_id`":`"$ROOM2`",`"title`":`"Test Booking`",`"purpose`":`"meeting`",`"start_time`":`"$start`",`"end_time`":`"$end`"}"
Write-Host "Created booking: $($booking.data.id)"

Write-Host "`n=== 7. POST /api/v1/bookings (overlap -> 409) ==="
try {
    Invoke-RestMethod -Uri "$BASE/api/v1/bookings" -Method POST -Headers @{Authorization = "Bearer $TOKEN"} -ContentType "application/json" -Body "{`"room_id`":`"$ROOM2`",`"title`":`"Overlap`",`"purpose`":`"meeting`",`"start_time`":`"$start`",`"end_time`":`"$end`"}" | Out-Null
} catch {
    Write-Host "Overlap status: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n=== 8. GET /api/v1/bookings?room_id=&from=&to= ==="
$bookings = Invoke-RestMethod -Uri "$BASE/api/v1/bookings?room_id=$ROOM2&from=$start&to=$end" -Headers @{Authorization = "Bearer $TOKEN"}
Write-Host "Bookings count: $($bookings.data.Count)"

Write-Host "`n=== 9. CRUD /api/v1/assignments ==="
$assignBody = '{"title":"Math HW","assignment_type":"individual","max_score":100,"status":"published"}'
$assign = Invoke-RestMethod -Uri "$BASE/api/v1/assignments" -Method POST -Headers @{Authorization = "Bearer $TOKEN"} -ContentType "application/json" -Body $assignBody
$ASSIGN = $assign.data.id
Write-Host "Created assignment: $ASSIGN"
$assignList = Invoke-RestMethod -Uri "$BASE/api/v1/assignments" -Headers @{Authorization = "Bearer $TOKEN"}
Write-Host "Assignments count: $($assignList.data.Count)"
Invoke-RestMethod -Uri "$BASE/api/v1/assignments/$ASSIGN" -Method DELETE -Headers @{Authorization = "Bearer $TOKEN"} | Out-Null
Write-Host "DELETE completed"

Write-Host "`n=== 10. POST /api/v1/submissions ==="
$assign2Body = '{"title":"Submit Test","assignment_type":"individual","max_score":100,"status":"published"}'
$assign2 = Invoke-RestMethod -Uri "$BASE/api/v1/assignments" -Method POST -Headers @{Authorization = "Bearer $TOKEN"} -ContentType "application/json" -Body $assign2Body
$ASSIGN2 = $assign2.data.id
$studentLogin = Invoke-RestMethod -Uri "$BASE/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"student@school.edu","password":"student123"}'
$STUDENT_TOKEN_FOR_SUBMIT = $studentLogin.data.access_token
$STUDENT = $studentLogin.data.user.id
$subBody = "{`"assignment_id`":`"$ASSIGN2`",`"content`":`"My answer`"}"
$submission = Invoke-RestMethod -Uri "$BASE/api/v1/submissions" -Method POST -Headers @{Authorization = "Bearer $STUDENT_TOKEN_FOR_SUBMIT"} -ContentType "application/json" -Body $subBody
Write-Host "Created submission: $($submission.data.id)"

Write-Host "`n=== 11. CRUD /api/v1/attendance ==="
$sessionDate = (Get-Date -Format "yyyy-MM-dd")
$sessionBody = "{`"room_id`":`"$ROOM2`",`"session_date`":`"$sessionDate`",`"start_time`":`"09:00`",`"end_time`":`"10:00`",`"status`":`"open`"}"
$session = Invoke-RestMethod -Uri "$BASE/api/v1/attendance/sessions" -Method POST -Headers @{Authorization = "Bearer $TOKEN"} -ContentType "application/json" -Body $sessionBody
$SESSION = $session.data.id
Write-Host "Created session: $SESSION"
$sessionList = Invoke-RestMethod -Uri "$BASE/api/v1/attendance/sessions" -Headers @{Authorization = "Bearer $TOKEN"}
Write-Host "Sessions count: $($sessionList.data.Count)"
Invoke-RestMethod -Uri "$BASE/api/v1/attendance/sessions/$SESSION" -Method DELETE -Headers @{Authorization = "Bearer $TOKEN"} | Out-Null
Write-Host "DELETE completed"

Write-Host "`n=== 12. POST /api/v1/grades ==="
$gradeBody = "{`"student_id`":`"$STUDENT`",`"item_type`":`"assignment`",`"item_id`":`"$ASSIGN2`",`"score`":85,`"max_score`":100,`"feedback`":`"Good job`"}"
$grade = Invoke-RestMethod -Uri "$BASE/api/v1/grades" -Method POST -Headers @{Authorization = "Bearer $TOKEN"} -ContentType "application/json" -Body $gradeBody
Write-Host "Created grade: $($grade.data.id)"

Write-Host "`n=== 13. GET /api/v1/notifications ==="
$notifs = Invoke-RestMethod -Uri "$BASE/api/v1/notifications" -Headers @{Authorization = "Bearer $TOKEN"}
Write-Host "Notifications count: $($notifs.data.Count)"

Write-Host "`n=== 14. GET /api/v1/export/attendance (CSV download) ==="
$csv = Invoke-RestMethod -Uri "$BASE/api/v1/export/attendance" -Headers @{Authorization = "Bearer $TOKEN"}
Write-Host "CSV length: $($csv.Length) bytes"

Write-Host "`n=== 15. Role-guard rejection (403) ==="
$studentLogin = Invoke-RestMethod -Uri "$BASE/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"student@school.edu","password":"student123"}'
$STUDENT_TOKEN = $studentLogin.data.access_token
try {
    Invoke-RestMethod -Uri "$BASE/api/v1/users" -Headers @{Authorization = "Bearer $STUDENT_TOKEN"} | Out-Null
} catch {
    Write-Host "Student accessing /users status: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n=== All curl tests completed ==="
