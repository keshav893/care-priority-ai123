import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Heart, Thermometer, Wind, User, FileText, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PatientInput } from "@/lib/triageEngine";

interface Props {
  onSubmit: (data: PatientInput) => void;
  isProcessing: boolean;
}

const PatientForm = ({ onSubmit, isProcessing }: Props) => {
  const [form, setForm] = useState({
    age: "",
    symptoms: "",
    heartRate: "",
    systolicBP: "",
    diastolicBP: "",
    oxygenLevel: "",
    temperature: "",
    medicalHistory: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const age = Number(form.age);
    if (!form.age || isNaN(age) || age < 0 || age > 120) e.age = "Enter a valid age (0–120)";
    if (!form.symptoms.trim()) e.symptoms = "Please describe the symptoms";
    if (form.symptoms.length > 1000) e.symptoms = "Symptoms must be under 1000 characters";
    const hr = Number(form.heartRate);
    if (!form.heartRate || isNaN(hr) || hr < 20 || hr > 250) e.heartRate = "Enter valid heart rate (20–250 bpm)";
    const sbp = Number(form.systolicBP);
    if (!form.systolicBP || isNaN(sbp) || sbp < 50 || sbp > 300) e.systolicBP = "Enter valid systolic BP (50–300)";
    const dbp = Number(form.diastolicBP);
    if (!form.diastolicBP || isNaN(dbp) || dbp < 20 || dbp > 200) e.diastolicBP = "Enter valid diastolic BP (20–200)";
    const o2 = Number(form.oxygenLevel);
    if (!form.oxygenLevel || isNaN(o2) || o2 < 50 || o2 > 100) e.oxygenLevel = "Enter valid SpO₂ (50–100%)";
    const temp = Number(form.temperature);
    if (!form.temperature || isNaN(temp) || temp < 30 || temp > 45) e.temperature = "Enter valid temp (30–45°C)";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      age: Number(form.age),
      symptoms: form.symptoms.trim(),
      heartRate: Number(form.heartRate),
      systolicBP: Number(form.systolicBP),
      diastolicBP: Number(form.diastolicBP),
      oxygenLevel: Number(form.oxygenLevel),
      temperature: Number(form.temperature),
      medicalHistory: form.medicalHistory.trim() || undefined,
    });
  };

  const inputClass = "bg-background border-border focus:ring-primary";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Demographics */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <User className="h-5 w-5 text-primary" /> Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" placeholder="e.g. 45" value={form.age} onChange={e => set("age", e.target.value)} className={inputClass} />
              {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Stethoscope className="h-5 w-5 text-primary" /> Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="symptoms">Describe all symptoms</Label>
              <Textarea id="symptoms" rows={3} placeholder="e.g. chest pain, shortness of breath, dizziness" value={form.symptoms} onChange={e => set("symptoms", e.target.value)} className={inputClass} />
              {errors.symptoms && <p className="text-sm text-destructive mt-1">{errors.symptoms}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Vitals */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Activity className="h-5 w-5 text-primary" /> Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heartRate" className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> Heart Rate (bpm)</Label>
              <Input id="heartRate" type="number" placeholder="e.g. 80" value={form.heartRate} onChange={e => set("heartRate", e.target.value)} className={inputClass} />
              {errors.heartRate && <p className="text-sm text-destructive mt-1">{errors.heartRate}</p>}
            </div>
            <div>
              <Label htmlFor="oxygenLevel" className="flex items-center gap-1"><Wind className="h-3.5 w-3.5" /> SpO₂ (%)</Label>
              <Input id="oxygenLevel" type="number" placeholder="e.g. 98" value={form.oxygenLevel} onChange={e => set("oxygenLevel", e.target.value)} className={inputClass} />
              {errors.oxygenLevel && <p className="text-sm text-destructive mt-1">{errors.oxygenLevel}</p>}
            </div>
            <div>
              <Label htmlFor="systolicBP">Systolic BP (mmHg)</Label>
              <Input id="systolicBP" type="number" placeholder="e.g. 120" value={form.systolicBP} onChange={e => set("systolicBP", e.target.value)} className={inputClass} />
              {errors.systolicBP && <p className="text-sm text-destructive mt-1">{errors.systolicBP}</p>}
            </div>
            <div>
              <Label htmlFor="diastolicBP">Diastolic BP (mmHg)</Label>
              <Input id="diastolicBP" type="number" placeholder="e.g. 80" value={form.diastolicBP} onChange={e => set("diastolicBP", e.target.value)} className={inputClass} />
              {errors.diastolicBP && <p className="text-sm text-destructive mt-1">{errors.diastolicBP}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="temperature" className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" /> Temperature (°C)</Label>
              <Input id="temperature" type="number" step="0.1" placeholder="e.g. 37.0" value={form.temperature} onChange={e => set("temperature", e.target.value)} className={inputClass} />
              {errors.temperature && <p className="text-sm text-destructive mt-1">{errors.temperature}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <FileText className="h-5 w-5 text-primary" /> Medical History <span className="text-sm font-normal text-muted-foreground">(optional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea id="medicalHistory" rows={2} placeholder="e.g. hypertension, diabetes, previous heart surgery" value={form.medicalHistory} onChange={e => set("medicalHistory", e.target.value)} className={inputClass} />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full font-display text-base" disabled={isProcessing}>
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block">⟳</motion.span>
              Analyzing…
            </span>
          ) : (
            "Run Triage Assessment"
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default PatientForm;
