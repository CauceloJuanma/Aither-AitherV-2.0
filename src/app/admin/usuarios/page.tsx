'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/auth/Navbar';
import { UserData, UserRole } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

interface CreateUserFormData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  allowGoogleAuth: boolean;
}

export default function UsuariosAdminPage() {
  const router = useRouter();
  useAuth(); // Necesario para verificar autenticación
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    password: '',
    displayName: '',
    role: 'neumólogo',
    allowGoogleAuth: false,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email,
          role: data.role,
          displayName: data.displayName || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          authMethods: data.authMethods || [],
          primaryUid: data.primaryUid || doc.id,
          linkedUids: data.linkedUids || [],
        } as UserData;
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      // Obtener token del usuario actual
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError('No se pudo obtener el token de autenticación');
        setCreating(false);
        return;
      }

      // Llamar a la API para crear el usuario
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          role: formData.role,
          allowGoogleAuth: formData.allowGoogleAuth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear usuario');
        setCreating(false);
        return;
      }

      // Éxito - actualizar la lista y resetear el formulario
      const authMethod = formData.allowGoogleAuth ? 'con Google Auth' : 'con contraseña';
      setSuccess(`Usuario ${formData.email} creado exitosamente (${authMethod})`);
      setFormData({
        email: '',
        password: '',
        displayName: '',
        role: 'neumólogo',
        allowGoogleAuth: false,
      });
      setShowPassword(false);
      setShowCreateForm(false);
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError('Error al crear usuario: ' + errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el usuario ${email}?`)) {
      return;
    }

    try {
      // Obtener token del usuario actual
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError('No se pudo obtener el token de autenticación');
        return;
      }

      // Llamar a la API para eliminar el usuario
      const response = await fetch(`/api/admin/users?uid=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al eliminar usuario');
        return;
      }

      setSuccess(`Usuario ${email} eliminado exitosamente`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error al eliminar usuario');
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      displayName: user.displayName || '',
      role: user.role,
      allowGoogleAuth: user.authMethods?.includes('google.com') || false,
    });
    setShowEditForm(true);
    setShowCreateForm(false);
    setError('');
    setSuccess('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    if (!editingUser) {
      setError('No hay usuario seleccionado para editar');
      setUpdating(false);
      return;
    }

    try {
      // Obtener token del usuario actual
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError('No se pudo obtener el token de autenticación');
        setUpdating(false);
        return;
      }

      // Llamar a la API para actualizar el usuario
      const response = await fetch(`/api/admin/users/${editingUser.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al actualizar usuario');
        setUpdating(false);
        return;
      }

      // Éxito - actualizar la lista y cerrar el formulario
      setSuccess(`Usuario ${editingUser.email} actualizado exitosamente`);
      setShowEditForm(false);
      setEditingUser(null);
      setShowPassword(false);
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError('Error al actualizar usuario: ' + errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    return role === 'admin'
      ? 'bg-purple-100 text-purple-800 border-purple-300'
      : 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getAuthMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      'password': 'Contraseña',
      'google.com': 'Google',
    };
    return labels[method] || method;
  };

  const getAuthMethodBadgeColor = (method: string) => {
    const colors: { [key: string]: string } = {
      'password': 'bg-green-100 text-green-800 border-green-300',
      'google.com': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[method] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administración de Usuarios</h1>
              <p className="text-gray-600 mt-1">Gestiona los accesos al sistema</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium text-sm"
            >
              Volver al inicio
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Create User Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                if (showCreateForm) {
                  setShowPassword(false);
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm"
            >
              {showCreateForm ? 'Cancelar' : 'Crear nuevo usuario'}
            </button>
          </div>

          {/* Create User Form */}
          {showCreateForm && (
            <Card>
                <CardHeader>
                  <CardTitle>Crear Nuevo Usuario</CardTitle>
                  <CardDescription>Complete los datos del nuevo usuario</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="usuario@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dr. Juan Pérez"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Contraseña {formData.allowGoogleAuth && '(opcional)'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required={!formData.allowGoogleAuth}
                          minLength={6}
                          disabled={formData.allowGoogleAuth}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder={formData.allowGoogleAuth ? 'No requerida con Google Auth' : 'Mínimo 6 caracteres'}
                        />
                        {!formData.allowGoogleAuth && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Rol
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="neumólogo">Neumólogo (solo lectura)</option>
                        <option value="admin">Administrador (acceso completo)</option>
                      </select>
                    </div>
                  </div>

                  {/* Opción de Google Auth */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="allowGoogleAuth"
                      checked={formData.allowGoogleAuth}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          allowGoogleAuth: checked,
                          password: checked ? '' : formData.password
                        });
                        if (checked) {
                          setShowPassword(false);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="allowGoogleAuth" className="flex-1 cursor-pointer">
                      <div className="text-sm font-medium text-gray-900">
                        Permitir autenticación con Google
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        El usuario podrá iniciar sesión con su cuenta de Google sin necesidad de contraseña.
                        Solo podrá acceder si su email está registrado aquí.
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setShowPassword(false);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className={`
                        px-6 py-2 rounded-lg font-semibold text-white transition-colors duration-200
                        ${creating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                      `}
                    >
                      {creating ? 'Creando...' : 'Crear usuario'}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Edit User Form */}
          {showEditForm && editingUser && (
            <Card>
              <CardHeader>
                <CardTitle>Editar Usuario</CardTitle>
                <CardDescription>Actualiza la información del usuario</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">El email no se puede modificar</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dr. Juan Pérez"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Rol
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="neumólogo">Neumólogo (solo lectura)</option>
                        <option value="admin">Administrador (acceso completo)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Métodos de autenticación
                      </label>
                      <div className="flex flex-wrap gap-1 pt-2">
                        {editingUser.authMethods && editingUser.authMethods.length > 0 ? (
                          editingUser.authMethods.map((method) => (
                            <span
                              key={method}
                              className={`px-2 py-1 rounded text-xs font-medium border ${getAuthMethodBadgeColor(method)}`}
                            >
                              {getAuthMethodLabel(method)}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Ninguno</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Los métodos de autenticación no se pueden modificar</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingUser(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className={`
                        px-6 py-2 rounded-lg font-semibold text-white transition-colors duration-200
                        ${updating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                      `}
                    >
                      {updating ? 'Actualizando...' : 'Actualizar usuario'}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando usuarios...</p>
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No hay usuarios registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Métodos de Auth</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha de creación</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{user.email}</td>
                          <td className="py-3 px-4 text-gray-700">{user.displayName || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                              {user.role === 'admin' ? 'Administrador' : 'Neumólogo'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {user.authMethods && user.authMethods.length > 0 ? (
                                user.authMethods.map((method) => (
                                  <span
                                    key={method}
                                    className={`px-2 py-1 rounded text-xs font-medium border ${getAuthMethodBadgeColor(method)}`}
                                  >
                                    {getAuthMethodLabel(method)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {user.createdAt.toLocaleDateString('es-ES')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.uid, user.email)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
