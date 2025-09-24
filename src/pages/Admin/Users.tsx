import React, { useState, useEffect } from 'react';
import { Users, Shield, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { Profile } from '@/contexts/SessionContext';

interface UserWithProfile extends Profile {
  email: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_users_with_profiles');
    
    if (error) {
      showError('Error al cargar los usuarios.');
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMINISTRADOR' | 'COMERCIAL') => {
    setSaving(prev => ({ ...prev, [userId]: true }));
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (error) {
      showError('Error al actualizar el rol.');
    } else {
      showSuccess('Rol actualizado correctamente.');
      fetchUsers();
    }
    setSaving(prev => ({ ...prev, [userId]: false }));
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-[#00FF80]" />
            Usuarios del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-900/50">
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Rol</TableHead>
                <TableHead className="text-right text-gray-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="text-center text-gray-400 py-8">Cargando...</TableCell></TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id} className="border-gray-800">
                    <TableCell className="text-white">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value: 'ADMINISTRADOR' | 'COMERCIAL') => handleRoleChange(user.id, value)}
                        disabled={saving[user.id]}
                      >
                        <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#121212] border-gray-800 text-white">
                          <SelectItem value="ADMINISTRADOR" className="hover:bg-gray-800">ADMINISTRADOR</SelectItem>
                          <SelectItem value="COMERCIAL" className="hover:bg-gray-800">COMERCIAL</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {saving[user.id] && <Loader2 className="h-4 w-4 animate-spin inline-block" />}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;