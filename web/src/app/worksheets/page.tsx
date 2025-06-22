"use client";
import WorksheetList from "../../components/WorksheetList";
import WorksheetCreateForm from "../../components/WorksheetCreateForm";
import WorksheetElementList from "../../components/WorksheetElementList";
import WorksheetElementCreateForm from "../../components/WorksheetElementCreateForm";
import AIWorksheetGenerator from "../../components/AIWorksheetGenerator";
import { useState } from "react";
import { Worksheet } from "../../types/database";

export default function WorksheetsPage() {
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const handleWorksheetCreated = () => {
    setRefresh((r) => r + 1);
    setShowAIGenerator(false);
  };

  const handleWorksheetCreatedWithAI = () => {
    setRefresh((r) => r + 1);
    setShowAIGenerator(false);
  };

  return (
    <div>
      <h1>Worksheets</h1>
      <WorksheetCreateForm 
        onWorksheetCreated={handleWorksheetCreated}
        onWorksheetCreatedWithAI={handleWorksheetCreatedWithAI}
      />
      <WorksheetList key={refresh} onSelect={setSelectedWorksheet} refresh={refresh} />

      {selectedWorksheet && (
        <div style={{ marginTop: 32 }}>
          <h2>{selectedWorksheet.title}</h2>
          
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowAIGenerator(!showAIGenerator)}
              style={{
                backgroundColor: showAIGenerator ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 4,
                cursor: 'pointer',
                marginRight: 8
              }}
            >
              {showAIGenerator ? '❌ AI Sluiten' : '🤖 AI Generator'}
            </button>
          </div>
          
          {showAIGenerator && (
            <AIWorksheetGenerator 
              worksheetId={selectedWorksheet.id} 
              onQuestionsGenerated={() => {
                setRefresh((r) => r + 1);
              }}
            />
          )}
          
          <WorksheetElementCreateForm worksheetId={selectedWorksheet.id} onElementCreated={() => setRefresh((r) => r + 1)} />
          <WorksheetElementList worksheetId={selectedWorksheet.id} />
        </div>
      )}
    </div>
  );
}