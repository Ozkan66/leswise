"use client";
import SharedWorksheetsManager from "../../components/SharedWorksheetsManager";
import PageLayout from "../../components/PageLayout";

export default function SharedWorksheetsPage() {
  return (
    <PageLayout 
      title="Shared Worksheets"
      description="Bekijk werkbladen die met jou gedeeld zijn en deel je eigen werkbladen met anderen."
      maxWidth="xl"
    >
      <SharedWorksheetsManager />
    </PageLayout>
  );
}