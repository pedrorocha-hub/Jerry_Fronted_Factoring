import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface UserWithProfile {
  id: string;
  email: string;
  role: 'ADMINISTRADOR' | 'COMERCIAL';
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
    try {
      const { data, error } = await supabase.rpc('get_users_with_profiles');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMINISTRADOR' | 'COMERCIAL') => {
    setSaving(prev => ({ ...prev, [userId]: true }));
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;

      showSuccess('Rol de usuario actualizado.');
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error('Error updating role:', error);
      showError('No se pudo actualizar el rol.');
    } finally {
      setSaving(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Users className="h-6 w-6 mr-3 text-[#00FF80]" />
          Gestión de Usuarios
        </h1>
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Usuarios del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-900">
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white w-[200px]">Rol</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className="border-gray-800">
                      <TableCell className="text-white">{user.email}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value: 'ADMINISTRADOR' | 'COMERCIAL') => handleRoleChange(user.id, value)}
                          disabled={saving[user.id]}
                        >
                          <SelectTrigger className="w-[180px] bg-black border-gray-700 text-white">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#121212] border-gray-700 text-white">
                            <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                            <SelectItem value="COMERCIAL">Comercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        {saving[user.id] && <Loader2 className="h-4 w-4 animate-spin inline-block" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UsersPage;