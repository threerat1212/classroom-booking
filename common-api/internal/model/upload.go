package model

type UploadedFile struct {
	ID           string `json:"id"`
	URL          string `json:"url"`
	OriginalName string `json:"original_name"`
	MimeType     string `json:"mime_type"`
	SizeBytes    int64  `json:"size_bytes"`
}

type FileAccessResponse struct {
	URL string `json:"url"`
}
