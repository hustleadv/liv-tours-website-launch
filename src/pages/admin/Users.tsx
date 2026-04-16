import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Shield, 
  ShieldOff, 
  Loader2, 
  Users, 
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  isAdmin: boolean;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/auth');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch users with their roles using a custom query via edge function
      const { data, error } = await supabase.functions.invoke('get-admin-users');
      
      if (error) throw error;
      
      setUsers(data?.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η φόρτωση των χρηστών",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentIsAdmin: boolean) => {
    setUpdatingUserId(userId);
    try {
      if (currentIsAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) throw error;
        
        toast({
          title: "Επιτυχία",
          description: "Τα δικαιώματα admin αφαιρέθηκαν",
        });
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (error) throw error;
        
        toast({
          title: "Επιτυχία",
          description: "Τα δικαιώματα admin προστέθηκαν",
        });
      }
      
      // Refresh users list
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η ενημέρωση",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SEOHead
        title="Διαχείριση Χρηστών | LIV Tours Admin"
        description="User management"
        noindex={true}
      />

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h1 className="font-semibold text-primary">Διαχείριση Χρηστών</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Ανανέωση
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Σύνολο Χρηστών</p>
            <p className="text-2xl font-bold text-primary">{users.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-accent">
              {users.filter(u => u.isAdmin).length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Απλοί Χρήστες</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {users.filter(u => !u.isAdmin).length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Ενεργοί (7 ημέρες)</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => {
                if (!u.last_sign_in_at) return false;
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return new Date(u.last_sign_in_at) > sevenDaysAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-foreground">Όλοι οι Χρήστες</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Διαχειριστείτε τα δικαιώματα πρόσβασης της ομάδας σας
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Δεν βρέθηκαν χρήστες</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-foreground truncate">
                          {user.email}
                        </span>
                        {user.isAdmin && (
                          <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full flex-shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Εγγραφή: {formatDate(user.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          {user.last_sign_in_at ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-muted-foreground" />
                          )}
                          Τελευταία σύνδεση: {formatDate(user.last_sign_in_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <Button
                        variant={user.isAdmin ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleAdminRole(user.id, user.isAdmin)}
                        disabled={updatingUserId === user.id}
                        className={`gap-2 min-w-[160px] ${
                          user.isAdmin 
                            ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700' 
                            : 'bg-accent hover:bg-accent/90'
                        }`}
                      >
                        {updatingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.isAdmin ? (
                          <>
                            <ShieldOff className="w-4 h-4" />
                            Αφαίρεση Admin
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Ορισμός Admin
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-accent/5 border border-accent/20 rounded-xl p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Πληροφορίες Δικαιωμάτων</p>
              <p className="text-sm text-muted-foreground mt-1">
                Οι χρήστες με δικαιώματα Admin έχουν πλήρη πρόσβαση στο διαχειριστικό panel. 
                Μπορούν να βλέπουν, επεξεργάζονται και διαχειρίζονται κρατήσεις, εκδρομές και χρήστες.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
