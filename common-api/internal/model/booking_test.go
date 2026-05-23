package model

import (
	"encoding/json"
	"testing"
)

func TestUpdateBookingRequestAcceptsRoomID(t *testing.T) {
	var req UpdateBookingRequest

	err := json.Unmarshal([]byte(`{"room_id":"11111111-1111-1111-1111-111111111111"}`), &req)
	if err != nil {
		t.Fatalf("json.Unmarshal() error = %v", err)
	}

	if req.RoomID == nil || *req.RoomID != "11111111-1111-1111-1111-111111111111" {
		t.Fatalf("RoomID = %v, want requested room id", req.RoomID)
	}
}
