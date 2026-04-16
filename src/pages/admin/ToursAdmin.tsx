import AdminLayout from "@/components/admin/AdminLayout";
import { ToursManagement } from "@/components/admin/ToursManagement";
import SEOHead from "@/components/SEOHead";

const ToursAdmin = () => {
  return (
    <AdminLayout 
      title="Content Manager" 
      subtitle="Διαχειριστείτε τις εκδρομές, διαδρομές και τιμές σας."
    >
      <SEOHead title="Διαχείριση Περιεχομένου | LIV Tours Admin" description="Manage tour content" noindex={true} />
      <ToursManagement />
    </AdminLayout>
  );
};

export default ToursAdmin;
