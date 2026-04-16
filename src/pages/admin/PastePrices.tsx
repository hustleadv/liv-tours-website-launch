import AdminLayout from "@/components/admin/AdminLayout";
import { PricesManagement } from "@/components/admin/PricesManagement";
import RoutesAdmin from "@/components/admin/RoutesAdmin";
import SEOHead from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

const PastePrices = () => {
  return (
    <AdminLayout 
      title="Τιμολόγηση" 
      subtitle="Διαχειριστείτε τις τιμές των μεταφορών αναλυτικά ή μαζικά."
    >
      <SEOHead title="Διαχείριση Τιμών | LIV Tours Admin" description="Manage travel prices" noindex={true} />
      
      <Tabs defaultValue="detailed" className="w-full">
        <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 mb-8 flex justify-between items-center">
           <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm h-auto">
             <TabsTrigger value="detailed" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg">
               <CreditCard className="w-4 h-4" />
               Αναλυτικές Τιμές
             </TabsTrigger>
             <TabsTrigger value="bulk" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg">
               <Upload className="w-4 h-4" />
               Μαζική Ενημέρωση (Paste)
             </TabsTrigger>
           </TabsList>
        </div>

        <TabsContent value="detailed" className="animate-in fade-in duration-500">
           <Card className="p-8 rounded-[40px] border-slate-100 bg-white overflow-hidden shadow-sm">
              <RoutesAdmin />
           </Card>
        </TabsContent>

        <TabsContent value="bulk" className="animate-in fade-in duration-500">
           <PricesManagement />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default PastePrices;
