#!/usr/bin/env bash
set -e

BASE="http://localhost:8080"

echo "=== 1. POST /api/v1/auth/login (success) ==="
TOKEN=$(curl -s -X POST "$BASE/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu","password":"admin123"}' | jq -r '.data.access_token // empty')
if [ -z "$TOKEN" ]; then echo "FAILED: no token"; exit 1; fi
echo "Token: ${TOKEN:0:20}..."

echo ""
echo "=== 2. POST /api/v1/auth/login (failure) ==="
curl -s -X POST "$BASE/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bad@school.edu","password":"wrong"}' | jq .

echo ""
echo "=== 3. GET /api/v1/users (with auth) ==="
curl -s "$BASE/api/v1/users" -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo ""
echo "=== 4. GET /api/v1/users (without auth -> 401) ==="
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/users"
echo ""

echo ""
echo "=== 5. CRUD /api/v1/rooms ==="
ROOM=$(curl -s -X POST "$BASE/api/v1/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","capacity":30,"type":"classroom","floor":"1","building":"A"}' | jq -r '.data.id')
echo "Created room: $ROOM"
curl -s "$BASE/api/v1/rooms/$ROOM" -H "Authorization: Bearer $TOKEN" | jq '.data.name'
curl -s -X PUT "$BASE/api/v1/rooms/$ROOM" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Room","capacity":35}' | jq '.data.name'
curl -s -X DELETE "$BASE/api/v1/rooms/$ROOM" -H "Authorization: Bearer $TOKEN" -o /dev/null -w "DELETE status: %{http_code}\n"

echo ""
echo "=== 6. POST /api/v1/bookings (success) ==="
# Create a room first for booking test
ROOM2=$(curl -s -X POST "$BASE/api/v1/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Booking Test","capacity":20,"type":"meeting","floor":"2","building":"B"}' | jq -r '.data.id')
START=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
END=$(date -u -d "+1 hour" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+1H +"%Y-%m-%dT%H:%M:%SZ")
curl -s -X POST "$BASE/api/v1/bookings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"room_id\":\"$ROOM2\",\"title\":\"Test Booking\",\"start_time\":\"$START\",\"end_time\":\"$END\"}" | jq '.data.id // .error'

echo ""
echo "=== 7. POST /api/v1/bookings (overlap -> 409) ==="
curl -s -X POST "$BASE/api/v1/bookings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"room_id\":\"$ROOM2\",\"title\":\"Overlap\",\"start_time\":\"$START\",\"end_time\":\"$END\"}" | jq '.error.code // "OK"'

echo ""
echo "=== 8. GET /api/v1/bookings?room_id=&from=&to= ==="
curl -s "$BASE/api/v1/bookings?room_id=$ROOM2&from=$START&to=$END" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo ""
echo "=== 9. CRUD /api/v1/assignments ==="
ASSIGN=$(curl -s -X POST "$BASE/api/v1/assignments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Math HW","assignment_type":"individual","status":"published"}' | jq -r '.data.id')
echo "Created assignment: $ASSIGN"
curl -s "$BASE/api/v1/assignments" -H "Authorization: Bearer $TOKEN" | jq '.data | length'
curl -s -X DELETE "$BASE/api/v1/assignments/$ASSIGN" -H "Authorization: Bearer $TOKEN" -o /dev/null -w "DELETE status: %{http_code}\n"

echo ""
echo "=== 10. POST /api/v1/submissions ==="
# Need an assignment to submit
ASSIGN2=$(curl -s -X POST "$BASE/api/v1/assignments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Submit Test","assignment_type":"individual","status":"published"}' | jq -r '.data.id')
STUDENT=$(curl -s "$BASE/api/v1/users" -H "Authorization: Bearer $TOKEN" | jq -r '.data[1].id')
curl -s -X POST "$BASE/api/v1/submissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"assignment_id\":\"$ASSIGN2\",\"student_id\":\"$STUDENT\",\"content\":\"My answer\"}" | jq '.data.id // .error'

echo ""
echo "=== 11. CRUD /api/v1/attendance ==="
SESSION=$(curl -s -X POST "$BASE/api/v1/attendance/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"room_id\":\"$ROOM2\",\"session_date\":\"$(date +%Y-%m-%d)\",\"start_time\":\"09:00\",\"end_time\":\"10:00\",\"status\":\"open\"}" | jq -r '.data.id')
echo "Created session: $SESSION"
curl -s "$BASE/api/v1/attendance/sessions" -H "Authorization: Bearer $TOKEN" | jq '.data | length'
curl -s -X DELETE "$BASE/api/v1/attendance/sessions/$SESSION" -H "Authorization: Bearer $TOKEN" -o /dev/null -w "DELETE status: %{http_code}\n"

echo ""
echo "=== 12. POST /api/v1/grades batch ==="
curl -s -X POST "$BASE/api/v1/grades" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"student_id\":\"$STUDENT\",\"item_type\":\"assignment\",\"item_id\":\"$ASSIGN2\",\"score\":85,\"max_score\":100,\"feedback\":\"Good job\"}" | jq '.data.id // .error'

echo ""
echo "=== 13. GET /api/v1/notifications ==="
curl -s "$BASE/api/v1/notifications" -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo ""
echo "=== 14. GET /api/v1/export/attendance (CSV download) ==="
curl -s -o /dev/null -w "CSV status: %{http_code}\n" "$BASE/api/v1/export/attendance" -H "Authorization: Bearer $TOKEN"

echo ""
echo "=== 15. Role-guard rejection (403) ==="
# Try to access admin-only endpoint as a student (if student token available)
STUDENT_TOKEN=$(curl -s -X POST "$BASE/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@school.edu","password":"student123"}' | jq -r '.data.access_token // empty')
if [ -n "$STUDENT_TOKEN" ]; then
  curl -s -o /dev/null -w "Student accessing /users: %{http_code}\n" "$BASE/api/v1/users" -H "Authorization: Bearer $STUDENT_TOKEN"
else
  echo "No student user available for role-guard test"
fi

echo ""
echo "=== All curl tests completed ==="
