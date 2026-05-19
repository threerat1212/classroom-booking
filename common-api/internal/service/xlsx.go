package service

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"strings"
)

func WriteSimpleXLSX(w io.Writer, sheetName string, rows [][]string) error {
	zipWriter := zip.NewWriter(w)
	files := map[string]string{
		"[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
		"_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
		"xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
		"xl/workbook.xml": fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="%s" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`, xmlEscapeAttr(safeSheetName(sheetName))),
		"xl/worksheets/sheet1.xml": buildWorksheetXML(rows),
	}
	for name, content := range files {
		f, err := zipWriter.Create(name)
		if err != nil {
			return err
		}
		if _, err := f.Write([]byte(content)); err != nil {
			return err
		}
	}
	return zipWriter.Close()
}

func buildWorksheetXML(rows [][]string) string {
	var b strings.Builder
	b.WriteString(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`)
	b.WriteString(`<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`)
	for rowIndex, row := range rows {
		r := rowIndex + 1
		b.WriteString(fmt.Sprintf(`<row r="%d">`, r))
		for colIndex, value := range row {
			cellRef := fmt.Sprintf("%s%d", columnName(colIndex+1), r)
			b.WriteString(fmt.Sprintf(`<c r="%s" t="inlineStr"><is><t>`, cellRef))
			b.WriteString(xmlEscapeText(value))
			b.WriteString(`</t></is></c>`)
		}
		b.WriteString(`</row>`)
	}
	b.WriteString(`</sheetData></worksheet>`)
	return b.String()
}

func columnName(col int) string {
	var name []byte
	for col > 0 {
		col--
		name = append([]byte{byte('A' + col%26)}, name...)
		col /= 26
	}
	return string(name)
}

func safeSheetName(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		name = "Sheet1"
	}
	replacer := strings.NewReplacer("[", " ", "]", " ", "*", " ", "?", " ", "/", " ", "\\", " ", ":", " ")
	name = strings.TrimSpace(replacer.Replace(name))
	if len([]rune(name)) > 31 {
		return string([]rune(name)[:31])
	}
	return name
}

func xmlEscapeText(value string) string {
	var b bytes.Buffer
	_ = xml.EscapeText(&b, []byte(value))
	return b.String()
}

func xmlEscapeAttr(value string) string {
	return strings.NewReplacer("&", "&amp;", `"`, "&quot;", "<", "&lt;", ">", "&gt;").Replace(value)
}
