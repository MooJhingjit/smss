"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogTable } from "@/components/log-table";
import { AuditLog } from "@prisma/client";

export function LogClient() {
  const [models, setModels] = useState<string[]>([]);
  const [logs, setLogs] = useState<(AuditLog & { user: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("/api/logs?distinct=model");
        const data = await res.json();
        setModels(data);
        if (data.length > 0) {
          setActiveTab(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch models", error);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (activeTab) {
      const fetchLogs = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/logs?model=${activeTab}`);
          const data = await res.json();
          setLogs(data);
        } catch (error) {
          console.error(`Failed to fetch logs for ${activeTab}`, error);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }
  }, [activeTab]);

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {models.map((model) => (
            <TabsTrigger key={model} value={model}>
              {model}
            </TabsTrigger>
          ))}
        </TabsList>
        {models.map((model) => (
          <TabsContent key={model} value={model}>
            {loading ? <p>Loading...</p> : <LogTable logs={logs} />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
