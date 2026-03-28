import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, ArrowUp, ArrowRight, ArrowDown, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { TriageResult, PriorityLevel } from "@/lib/triageEngine";

const priorityConfig: Record<PriorityLevel, { color: string; bg: string; icon: typeof AlertTriangle; label: string }> = {
  Critical: { color: "text-critical", bg: "bg-critical/10", icon: ShieldAlert, label: "CRITICAL" },
  High: { color: "text-high", bg: "bg-high/10", icon: AlertTriangle, label: "HIGH" },
  Medium: { color: "text-medium", bg: "bg-medium/10", icon: Clock, label: "MEDIUM" },
  Low: { color: "text-low", bg: "bg-low/10", icon: CheckCircle, label: "LOW" },
};

const impactIcon = { high: <ArrowUp className="h-4 w-4 text-critical" />, medium: <ArrowRight className="h-4 w-4 text-high" />, low: <ArrowDown className="h-4 w-4 text-low" /> };

interface Props {
  result: TriageResult;
}

const TriageResults = ({ result }: Props) => {
  const cfg = priorityConfig[result.priorityLevel];
  const Icon = cfg.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
      {/* Priority Banner */}
      <Card className={`${cfg.bg} border-2`} style={{ borderColor: `hsl(var(--${result.priorityLevel.toLowerCase() === "critical" ? "critical" : result.priorityLevel.toLowerCase()}))` }}>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <Icon className={`h-16 w-16 ${cfg.color}`} />
          </motion.div>
          <div className="text-center sm:text-left flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Priority Level</p>
            <h2 className={`text-3xl font-display font-bold ${cfg.color}`}>{cfg.label}</h2>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Risk Score</p>
            <motion.p className={`text-4xl font-display font-bold ${cfg.color}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {result.riskScore}%
            </motion.p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Low Risk</span><span>Critical</span>
        </div>
        <Progress value={result.riskScore} className="h-3" />
      </div>

      {/* Recommended Action */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Recommended Action</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{result.recommendedAction}</p>
        </CardContent>
      </Card>

      {/* Possible Conditions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Possible Conditions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {result.possibleConditions.map(c => (
            <Badge key={c} variant="secondary" className="text-sm">{c}</Badge>
          ))}
        </CardContent>
      </Card>

      {/* Explainability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Why This Assessment?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.explanations.length === 0 ? (
            <p className="text-muted-foreground text-sm">All vitals and symptoms appear within normal ranges.</p>
          ) : (
            result.explanations.map((ex, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                {impactIcon[ex.impact]}
                <div>
                  <p className="font-medium text-sm text-foreground">{ex.factor}</p>
                  <p className="text-sm text-muted-foreground">{ex.detail}</p>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center px-4">
        ⚠️ This is a simulation tool for educational purposes only. It does not replace professional medical judgment. Always consult a qualified healthcare provider.
      </p>
    </motion.div>
  );
};

export default TriageResults;
