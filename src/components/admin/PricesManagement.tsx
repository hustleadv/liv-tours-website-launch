import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clipboard, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Upload, 
  ArrowLeft,
  AlertCircle,
  Plus,
  Layers,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  REGIONS,
  PICKUP_ZONES,
  VEHICLE_CLASSES,
  parsePastedPrices,
  importPrices,
  type ParsedPriceRow,
} from "@/lib/fixedPrices";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BatchEntry {
  id: string;
  region: string;
  pickupZone: string;
  vehicleClass: string;
  passengersMin: number;
  passengersMax: number;
  tags: string;
  pastedText: string;
  parsedRows: ParsedPriceRow[];
}

const createEmptyBatch = (): BatchEntry => ({
  id: crypto.randomUUID(),
  region: "Chania",
  pickupZone: "Chania Airport",
  vehicleClass: "Taxi",
  passengersMin: 1,
  passengersMax: 4,
  tags: "",
  pastedText: "",
  parsedRows: [],
});

export const PricesManagement = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<BatchEntry[]>([createEmptyBatch()]);
  const [activeBatchTab, setActiveBatchTab] = useState<string>(batches[0].id);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<{ name: string; price: string }>({ name: "", price: "" });
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const currentBatch = batches.find(b => b.id === activeBatchTab) || batches[0];

  const updateCurrentBatch = (updates: Partial<BatchEntry>) => {
    setBatches(prev => prev.map(b => 
      b.id === activeBatchTab ? { ...b, ...updates } : b
    ));
  };

  const addBatch = () => {
    const newBatch = createEmptyBatch();
    setBatches(prev => [...prev, newBatch]);
    setActiveBatchTab(newBatch.id);
  };

  const removeBatch = (id: string) => {
    if (batches.length <= 1) return;
    const newBatches = batches.filter(b => b.id !== id);
    setBatches(newBatches);
    if (activeBatchTab === id) setActiveBatchTab(newBatches[0].id);
  };

  const duplicateBatch = () => {
    const newBatch: BatchEntry = {
      ...createEmptyBatch(),
      region: currentBatch.region,
      pickupZone: currentBatch.pickupZone,
      vehicleClass: currentBatch.vehicleClass,
      passengersMin: currentBatch.passengersMin,
      passengersMax: currentBatch.passengersMax,
      tags: currentBatch.tags,
    };
    setBatches(prev => [...prev, newBatch]);
    setActiveBatchTab(newBatch.id);
  };
  
  const handleParse = () => {
    if (!currentBatch.pastedText.trim()) {
      toast({ title: "No text to parse", variant: "destructive" });
      return;
    }
    const rows = parsePastedPrices(currentBatch.pastedText, {
      region: currentBatch.region as any,
      pickup_zone: currentBatch.pickupZone,
      vehicle_class: currentBatch.vehicleClass,
      passengers_min: currentBatch.passengersMin,
      passengers_max: currentBatch.passengersMax,
    });
    updateCurrentBatch({ parsedRows: rows });
    setImportResult(null);
    toast({ title: "Parsed successfully", description: `${rows.filter(r => r.isValid).length} valid rows` });
  };
  
  const handleRemoveRow = (index: number) => {
    updateCurrentBatch({ parsedRows: currentBatch.parsedRows.filter((_, i) => i !== index) });
  };
  
  const handleStartEdit = (index: number) => {
    const row = currentBatch.parsedRows[index];
    setEditingIndex(index);
    setEditValue({ name: row.dropoff_name, price: row.fixed_price_eur.toString() });
  };
  
  const handleSaveEdit = (index: number) => {
    const price = parseFloat(editValue.price);
    if (isNaN(price) || price <= 0) {
      toast({ title: "Invalid price", variant: "destructive" });
      return;
    }
    updateCurrentBatch({
      parsedRows: currentBatch.parsedRows.map((row, i) => 
        i === index ? { ...row, dropoff_name: editValue.name.trim(), fixed_price_eur: price, isValid: true, error: undefined } : row
      )
    });
    setEditingIndex(null);
  };

  const handleImportAll = async () => {
    const allValidRows = batches.flatMap(b => b.parsedRows.filter(r => r.isValid));
    if (allValidRows.length === 0) {
      toast({ title: "No valid rows", variant: "destructive" });
      return;
    }
    setIsImporting(true);
    try {
      const result = await importPrices(allValidRows);
      setImportResult(result);
      if (result.errors.length === 0) {
        toast({ title: "Import complete", description: `Added ${result.imported}, Updated ${result.updated}` });
        const freshBatch = createEmptyBatch();
        setBatches([freshBatch]);
        setActiveBatchTab(freshBatch.id);
      } else {
        toast({ title: "Import with errors", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Import failed", variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const counts = {
    total: batches.flatMap(b => b.parsedRows).length,
    valid: batches.flatMap(b => b.parsedRows.filter(r => r.isValid)).length,
    batches: batches.filter(b => b.parsedRows.length > 0).length,
  };

  return (
    <Card className="p-0 border-none bg-transparent shadow-none space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Clipboard className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Μαζική Εισαγωγή Τιμών</h2>
            <p className="text-sm text-slate-500 font-bold">Εισαγωγή πολλαπλών ζωνών ταυτόχρονα</p>
          </div>
        </div>
        
        {counts.valid > 0 && (
          <Button 
            onClick={handleImportAll} 
            disabled={isImporting}
            className="h-12 px-8 rounded-2xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200/50 hover:bg-emerald-700 transition-all"
          >
            {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
            Οριστική Εισαγωγή ({counts.valid})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-slate-100 rounded-[32px] p-6 bg-white shadow-sm space-y-6">
          <div className="space-y-4">
             <Label className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Περιοχή & Ζώνη</Label>
             <Select value={currentBatch.region} onValueChange={(v) => updateCurrentBatch({ region: v })}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
             </Select>
             <Select value={currentBatch.pickupZone} onValueChange={(v) => updateCurrentBatch({ pickupZone: v })}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PICKUP_ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                </SelectContent>
             </Select>
          </div>

          <div className="space-y-4">
             <Label className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Όχημα & Επιβάτες</Label>
             <Select value={currentBatch.vehicleClass} onValueChange={(v) => updateCurrentBatch({ vehicleClass: v })}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_CLASSES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
             </Select>
             <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="number" 
                  value={currentBatch.passengersMin} 
                  onChange={(e) => updateCurrentBatch({ passengersMin: parseInt(e.target.value) || 1 })}
                  className="h-12 rounded-2xl bg-slate-50 border-none font-bold"
                  placeholder="Min"
                />
                <Input 
                  type="number" 
                  value={currentBatch.passengersMax} 
                  onChange={(e) => updateCurrentBatch({ passengersMax: parseInt(e.target.value) || 4 })}
                  className="h-12 rounded-2xl bg-slate-50 border-none font-bold"
                  placeholder="Max"
                />
             </div>
          </div>

          <div className="pt-4">
             <Button onClick={handleParse} className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black shadow-lg">
                <Clipboard className="w-4 h-4 mr-2" />
                Επεξεργασία Κειμένου
             </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-2 flex items-center gap-2 overflow-x-auto">
              <Tabs value={activeBatchTab} onValueChange={setActiveBatchTab} className="w-full">
                 <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50">
                    <TabsList className="bg-transparent h-auto p-0 gap-2">
                      {batches.map((batch, idx) => (
                        <TabsTrigger 
                          key={batch.id} 
                          value={batch.id}
                          className="px-6 py-2 rounded-xl text-xs font-black transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                        >
                          Batch {idx + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="flex items-center gap-2">
                       <Button variant="ghost" size="sm" onClick={addBatch} className="rounded-xl font-bold">
                          <Plus className="w-4 h-4 mr-1" /> Νέο
                       </Button>
                       <Button variant="ghost" size="sm" onClick={duplicateBatch} className="rounded-xl font-bold">
                          <Layers className="w-4 h-4 mr-1" /> Αντίγραφο
                       </Button>
                    </div>
                 </div>

                 {batches.map(batch => (
                   <TabsContent key={batch.id} value={batch.id} className="p-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Textarea
                        value={batch.pastedText}
                        onChange={(e) => updateCurrentBatch({ pastedText: e.target.value })}
                        placeholder={`Προορισμός Τιμή\nAgia Marina 42.00\nPlatanias 35\nKissamos 55`}
                        className="min-h-[200px] rounded-3xl bg-slate-50 border-none font-mono text-sm p-6 focus:ring-2 focus:ring-emerald-400"
                      />
                      
                      {batch.parsedRows.length > 0 && (
                        <div className="mt-8 border border-slate-100 rounded-3xl overflow-hidden">
                           <Table>
                              <TableHeader className="bg-slate-50/50">
                                 <TableRow>
                                    <TableHead className="font-black text-[10px] uppercase pl-6 py-4">Προορισμός</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase py-4">Τιμή</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase py-4">Κατάσταση</TableHead>
                                    <TableHead className="text-right pr-6 py-4"></TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {batch.parsedRows.map((row, idx) => (
                                    <TableRow key={idx} className={cn("group hover:bg-slate-50", !row.isValid && "bg-red-50/30")}>
                                       <TableCell className="pl-6 font-bold text-slate-700">
                                          {editingIndex === idx && activeBatchTab === batch.id ? (
                                             <Input value={editValue.name} onChange={(e) => setEditValue(p => ({...p, name: e.target.value}))} className="h-8 rounded-lg" />
                                          ) : row.dropoff_name}
                                       </TableCell>
                                       <TableCell className="font-black text-emerald-600">
                                          {editingIndex === idx && activeBatchTab === batch.id ? (
                                             <Input type="number" value={editValue.price} onChange={(e) => setEditValue(p => ({...p, price: e.target.value}))} className="h-8 w-20 rounded-lg" />
                                          ) : `€${row.fixed_price_eur.toFixed(2)}`}
                                       </TableCell>
                                       <TableCell>
                                          <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", row.isValid ? "text-emerald-500 bg-emerald-50" : "text-red-500 bg-red-50")}>
                                             {row.isValid ? "OK" : "ERROR"}
                                          </span>
                                       </TableCell>
                                       <TableCell className="text-right pr-6">
                                          <div className="flex justify-end gap-1">
                                             {editingIndex === idx ? (
                                                <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(idx)}><Check className="w-4 h-4 text-emerald-600" /></Button>
                                             ) : (
                                                <Button size="icon" variant="ghost" onClick={() => handleStartEdit(idx)}><Edit2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /></Button>
                                             )}
                                             <Button size="icon" variant="ghost" onClick={() => handleRemoveRow(idx)}><Trash2 className="w-4 h-4 text-slate-300 group-hover:text-red-500" /></Button>
                                          </div>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                      )}
                   </TabsContent>
                 ))}
              </Tabs>
           </div>
        </div>
      </div>
    </Card>
  );
};
