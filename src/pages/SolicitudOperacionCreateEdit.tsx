import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, FilePlus, Loader2, AlertCircle, CheckCircle, FileText, ShieldCheck, User, Briefcase, XCircle, ArrowLeft, Calendar, RefreshCw, PlusCircle, Trash2, Plus, ClipboardCopy, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FichaRuc } from '@/types/ficha-ruc';
import { SolicitudOperacion, SolicitudOperacionRiesgo, SolicitudOperacionWithRiesgos, SolicitudStatus } from '@/types/solicitud-operacion';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';

// ... (interfaces se mantienen igual)

const SolicitudOperacionCreateEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useSession();
  const isCreateMode = !id;

  // ... (todos los useState se mantienen igual)

  // ... (todos los handlers y useEffect se mantienen igual hasta el return)

  if (isCreateMode) {
    // ... (el return para el modo creación se mantiene igual)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          {/* ... (el header se mantiene igual) */}

          <div className="space-y-6">
            {searchedFicha && (
              <div className="space-y-6">
                {/* ... (todas las cards existentes se mantienen igual) */}

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Análisis Crediticio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      Gestiona el análisis de comportamiento crediticio asociado a este expediente.
                    </p>
                    <Button
                      onClick={() => navigate(`/comportamiento-crediticio/manage/${id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!id}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Gestionar Comportamiento Crediticio
                    </Button>
                  </CardContent>
                </Card>

                {/* ... (la card de "Completar Datos" y el botón de guardar se mantienen igual) */}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudOperacionCreateEditPage;