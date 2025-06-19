"use client";
import WorksheetList from "../../components/WorksheetList";
import WorksheetCreateForm from "../../components/WorksheetCreateForm";
import WorksheetElementList from "../../components/WorksheetElementList";
import WorksheetElementCreateForm from "../../components/WorksheetElementCreateForm";
import { useState } from "react";

export default function WorksheetsPage() {
  const [selectedWorksheet, setSelectedWorksheet] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);

  return (
    <div>
      <h1>Worksheets</h1>
      <WorksheetCreateForm onWorksheetCreated={() => setRefresh((r) => r + 1)} />
      <WorksheetList key={refresh} onSelect={setSelectedWorksheet} refresh={refresh} />

      {selectedWorksheet && (
        <div style={{ marginTop: 32 }}>
          <h2>{selectedWorksheet.title}</h2>
          <WorksheetElementCreateForm worksheetId={selectedWorksheet.id} onElementCreated={() => setRefresh((r) => r + 1)} />
          <WorksheetElementList worksheetId={selectedWorksheet.id} />
        </div>
      )}
    </div>
  );
}
