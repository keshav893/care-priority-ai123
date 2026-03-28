import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, RotateCcw, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import PatientForm from "@/components/PatientForm";
import TriageResults from "@/components/TriageResults";
import { runTriage, type PatientInput, type TriageResult } from "@/lib/triageEngine";

const Index = () => {
  const { signOut } = useAuth();
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (data: PatientInput) => {
    setIsProcessing(true);
    // Simulate processing delay for realism
    setTimeout(() => {
      const triageResult = runTriage(data);
      setResult(triageResult);
      setIsProcessing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground tracking-tight">TriageAI</h1>
              <p className="text-xs text-muted-foreground">Healthcare Triage Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> New Assessment
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-3xl mx-auto py-8 px-4">
        {!result ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">Patient Triage Assessment</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Enter patient information and vital signs to receive an AI-powered severity assessment and priority recommendation.
              </p>
            </motion.div>
            <PatientForm onSubmit={handleSubmit} isProcessing={isProcessing} />
          </>
        ) : (
          <TriageResults result={result} />
        )}
      </main>
    </div>
  );
};

export default Index;
