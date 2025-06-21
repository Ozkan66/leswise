"use client";
import WorksheetList from "../../components/WorksheetList";
import WorksheetCreateForm from "../../components/WorksheetCreateForm";
import WorksheetElementList from "../../components/WorksheetElementList";
import WorksheetElementCreateForm from "../../components/WorksheetElementCreateForm";
import { useState } from "react";
import { Worksheet } from "../../types/database";

export default function WorksheetsPage() {
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
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
