'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import { 
  ChevronLeft, Lock, Shield, Eye, EyeOff, X, Check, Save,
  AlertTriangle, User, Users, ArrowRight, UserCog, Search, Filter
} from 'lucide-react';
import ClientLayout from '../../../components/ClientLayout';
import * as crypto from 'crypto-js';

// The permissions that can be assigned to roles
const permissions = [
  { id: 'manage_users', name: 'Kullanıcı Yönetimi', description: 'Kullanıcıları görüntüleme, düzenleme ve silme' },
  { id: 'manage_content', name: 'İçerik Yönetimi', description: 'Site içeriğini düzenleme ve yayınlama' },
  { id: 'manage_events', name: 'Etkinlik Yönetimi', description: 'Etkinlikleri oluşturma ve düzenleme' },
  { id: 'manage_sponsors', name: 'Sponsor Yönetimi', description: 'Sponsorları ekleme ve düzenleme' },
  { id: 'manage_market', name: 'Market Yönetimi', description: 'Market ürünlerini yönetme' },
  { id: 'manage_tickets', name: 'Bilet Yönetimi', description: 'Biletleri oluşturma ve düzenleme' },
  { id: 'manage_tournaments', name: 'Turnuva Yönetimi', description: 'Turnuvaları oluşturma ve düzenleme' },
  { id: 'manage_chat', name: 'Sohbet Moderasyonu', description: 'Sohbeti yönetme ve moderasyon' },
  { id: 'system_settings', name: 'Sistem Ayarları', description: 'Sistem ayarlarını değiştirme' },
  { id: 'manage_roles', name: 'Rol Yönetimi', description: 'Sistem rollerini yapılandırma (sadece özel erişim)' },
];

// Initial role definitions
const initialRoles = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Tam yetkili sistem yöneticisi',
    permissions: permissions.map(p => p.id),
    color: 'red',
    isDefault: false,
    canBeDeleted: false
  },
  {
    id: 'moderator',
    name: 'Moderatör',
    description: 'Sınırlı yetkilerle site moderasyonu',
    permissions: ['manage_users', 'manage_content', 'manage_chat'],
    color: 'blue',
    isDefault: false,
    canBeDeleted: true
  },
  {
    id: 'vip',
    name: 'VIP',
    description: 'VIP kullanıcılar',
    permissions: [],
    color: 'purple',
    isDefault: false,
    canBeDeleted: false
  },
  {
    id: 'user',
    name: 'Normal Kullanıcı',
    description: 'Standart kullanıcı hakları',
    permissions: [],
    color: 'gray',
    isDefault: true,
    canBeDeleted: false
  }
];

// The actual secret key for validation
const SECRET_KEY = 'MphTUiyAS50LaPDPNmZPkex2bfPO48MX';

// Sample users for demonstration
const demoUsers = [
  { id: '1', email: 'admin@example.com', name: 'Example User', jackPoints: 5000, rank: UserRank.NORMAL, lastActive: Date.now() - 60000, role: 'user' },
  { id: '2', email: 'vip@example.com', name: 'VIP User', jackPoints: 3500, rank: UserRank.VIP, lastActive: Date.now() - 3600000, role: 'vip' },
  { id: '3', email: 'normal@example.com', name: 'Regular User', jackPoints: 1200, rank: UserRank.NORMAL, lastActive: Date.now() - 86400000, role: 'user' },
  { id: '4', email: 'user1@example.com', name: 'User One', jackPoints: 750, rank: UserRank.NORMAL, lastActive: Date.now() - 172800000, role: 'user' },
  { id: '5', email: 'user2@example.com', name: 'User Two', jackPoints: 4200, rank: UserRank.VIP, lastActive: Date.now() - 14400000, role: 'vip' },
  { id: '6', email: 'sezarpaypals2@gmail.com', name: 'System Admin', jackPoints: 10000, rank: UserRank.ADMIN, lastActive: Date.now(), role: 'admin' },
  { id: '7', email: 'moderator@example.com', name: 'Chat Moderator', jackPoints: 2500, rank: UserRank.NORMAL, lastActive: Date.now() - 120000, role: 'moderator' },
];

// Define role interface
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  isDefault: boolean;
  canBeDeleted: boolean;
}

// User interface
interface User {
  id: string;
  email: string;
  name?: string;
  jackPoints: number;
  rank: UserRank;
  lastActive: number;
  role: string;
}

export default function AdminRolesPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(true);
  const [secretKey, setSecretKey] = useState('');
  const [secretKeyError, setSecretKeyError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user) {
      setLoading(false);
    }
  }, [user, loading, router]);

  // Verify the secret key
  const verifySecretKey = () => {
    if (secretKey === SECRET_KEY) {
      setIsAuthorized(true);
      setShowSecretKeyModal(false);
      setSecretKeyError(null);
    } else {
      setSecretKeyError('Geçersiz anahtar. Lütfen doğru anahtarı girin.');
    }
  };

  // Start editing a role
  const handleEditRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      setEditingRole({...role});
    }
  };

  // Toggle a permission for the role being edited
  const togglePermission = (permissionId: string) => {
    if (!editingRole) return;
    
    setEditingRole(prev => {
      if (!prev) return prev;
      
      const hasPermission = prev.permissions.includes(permissionId);
      let updatedPermissions = hasPermission
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId];
        
      // Special handling: manage_roles should only be available if you have all other permissions
      if (permissionId === 'manage_roles' && !hasPermission) {
        // To enable manage_roles, you need all other permissions
        updatedPermissions = permissions.map(p => p.id);
      }
      
      return {
        ...prev,
        permissions: updatedPermissions
      };
    });
  };

  // Save the edited role
  const saveRole = () => {
    if (!editingRole) return;
    
    setRoles(prev => 
      prev.map(role => 
        role.id === editingRole.id ? editingRole : role
      )
    );
    
    setEditingRole(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingRole(null);
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  };

  // Assign role to user
  const assignRoleToUser = (userId: string, roleId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              role: roleId,
              // Update rank based on role (in a real app, this would be more sophisticated)
              rank: roleId === 'admin' 
                ? UserRank.ADMIN 
                : roleId === 'vip' 
                  ? UserRank.VIP 
                  : UserRank.NORMAL
            } 
          : user
      )
    );
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      searchQuery === '' || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin" className="flex items-center text-blue-400 hover:text-blue-300 mb-2">
              <ChevronLeft className="w-5 h-5 mr-1" /> Admin Paneline Dön
            </Link>
            <h1 className="text-3xl font-bold text-white">Rol Yönetimi</h1>
            <p className="text-gray-400">Sistem rollerini ve izinlerini yapılandırın</p>
          </div>
        </div>

        {/* Secret Key Modal */}
        {showSecretKeyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => router.push('/admin')}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Güvenlik Doğrulaması</h2>
                <p className="text-gray-400 mt-2">
                  Rol yönetimi sayfasına erişmek için güvenlik anahtarını girmeniz gerekmektedir.
                </p>
              </div>
              
              <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-400">Dikkat</h3>
                    <p className="text-red-300 text-sm">
                      Bu sayfa yüksek güvenlikli ayarlar içermektedir. Sadece yetkili kişiler girebilir.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Güvenlik Anahtarı</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Anahtarı girin..."
                  />
                  <button 
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {secretKeyError && (
                  <p className="text-red-400 text-sm mt-2">{secretKeyError}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600"
                >
                  İptal
                </button>
                <button
                  onClick={verifySecretKey}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 flex items-center"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Doğrula
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Role Management Content - Only shown after authorization */}
        {isAuthorized && (
          <>
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'roles'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Roller ve İzinler</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'users'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserCog className="w-4 h-4" />
                    <span>Kullanıcı Rolleri</span>
                  </div>
                </button>
              </div>
            </div>

            {activeTab === 'roles' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Role List */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-750 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">Sistem Rolleri</h2>
                    <p className="text-gray-400 text-sm">Düzenlemek için bir rol seçin</p>
                  </div>
                  <div className="p-4">
                    <ul className="divide-y divide-gray-700">
                      {roles.map(role => (
                        <li 
                          key={role.id}
                          className={`py-3 px-2 cursor-pointer rounded hover:bg-gray-700 ${
                            selectedRole === role.id ? 'bg-gray-700' : ''
                          }`}
                          onClick={() => setSelectedRole(role.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full bg-${role.color}-500 mr-3`}></div>
                              <div>
                                <h3 className="font-medium text-white">{role.name}</h3>
                                <p className="text-sm text-gray-400">{role.description}</p>
                              </div>
                            </div>
                            {selectedRole === role.id && (
                              <ArrowRight className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Middle and Right Columns - Role Details and Permissions */}
                {selectedRole && !editingRole && (
                  <>
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-4 bg-gray-750 border-b border-gray-700">
                        <h2 className="text-xl font-semibold text-white">Rol Detayları</h2>
                      </div>
                      <div className="p-4">
                        {(() => {
                          const role = roles.find(r => r.id === selectedRole);
                          if (!role) return null;
                          
                          return (
                            <div>
                              <div className="flex items-center mb-4">
                                <div className={`w-4 h-4 rounded-full bg-${role.color}-500 mr-2`}></div>
                                <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                              </div>
                              
                              <p className="text-gray-300 mb-4">{role.description}</p>
                              
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-750 p-3 rounded-lg border border-gray-700">
                                  <p className="text-sm text-gray-400">Rol ID</p>
                                  <p className="font-mono text-gray-300">{role.id}</p>
                                </div>
                                <div className="bg-gray-750 p-3 rounded-lg border border-gray-700">
                                  <p className="text-sm text-gray-400">İzin Sayısı</p>
                                  <p className="text-gray-300">{role.permissions.length} / {permissions.length}</p>
                                </div>
                                <div className="bg-gray-750 p-3 rounded-lg border border-gray-700">
                                  <p className="text-sm text-gray-400">Varsayılan</p>
                                  <p className="text-gray-300">{role.isDefault ? 'Evet' : 'Hayır'}</p>
                                </div>
                                <div className="bg-gray-750 p-3 rounded-lg border border-gray-700">
                                  <p className="text-sm text-gray-400">Silinebilir</p>
                                  <p className="text-gray-300">{role.canBeDeleted ? 'Evet' : 'Hayır'}</p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleEditRole(role.id)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Rol İzinlerini Düzenle
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-4 bg-gray-750 border-b border-gray-700">
                        <h2 className="text-xl font-semibold text-white">İzinler</h2>
                      </div>
                      <div className="p-4">
                        {(() => {
                          const role = roles.find(r => r.id === selectedRole);
                          if (!role) return null;
                          
                          return (
                            <div>
                              <ul className="divide-y divide-gray-700">
                                {permissions.map(permission => {
                                  const hasPermission = role.permissions.includes(permission.id);
                                  
                                  return (
                                    <li key={permission.id} className="py-3">
                                      <div className="flex items-start">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 mr-3 ${
                                          hasPermission ? 'bg-green-500' : 'bg-gray-600'
                                        }`}>
                                          {hasPermission && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div>
                                          <h3 className="font-medium text-white">{permission.name}</h3>
                                          <p className="text-sm text-gray-400">{permission.description}</p>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                )}
                
                {/* Edit Role Permissions Mode */}
                {editingRole && (
                  <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-750 border-b border-gray-700 flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-white">İzinleri Düzenle: {editingRole.name}</h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={saveRole}
                          className="p-1.5 rounded bg-green-600 hover:bg-green-500 text-white"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-blue-400">İzin Yönetimi</h3>
                            <p className="text-blue-300 text-sm">
                              Aşağıdaki izinleri etkinleştirerek veya devre dışı bırakarak bu rolün yetkilerini yapılandırın.
                              "Rol Yönetimi" izni sadece tam yetkili kullanıcılara verilmelidir.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <ul className="space-y-2">
                        {permissions.map(permission => {
                          const hasPermission = editingRole.permissions.includes(permission.id);
                          const isRoleManagementPermission = permission.id === 'manage_roles';
                          
                          return (
                            <li 
                              key={permission.id} 
                              className={`p-3 rounded-lg border ${
                                isRoleManagementPermission
                                  ? 'bg-red-900/20 border-red-800/50'
                                  : 'bg-gray-750 border-gray-700'
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center">
                                    <h3 className={`font-medium ${
                                      isRoleManagementPermission ? 'text-red-300' : 'text-white'
                                    }`}>
                                      {permission.name}
                                    </h3>
                                    {isRoleManagementPermission && (
                                      <span className="ml-2 px-2 py-0.5 bg-red-900 text-red-300 rounded-full text-xs">
                                        Özel Güvenlik
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-sm ${
                                    isRoleManagementPermission ? 'text-red-300/70' : 'text-gray-400'
                                  }`}>
                                    {permission.description}
                                  </p>
                                </div>
                                <div className="ml-4">
                                  <button
                                    onClick={() => togglePermission(permission.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                      hasPermission 
                                        ? isRoleManagementPermission 
                                          ? 'bg-red-600' 
                                          : 'bg-green-600'
                                        : 'bg-gray-600'
                                    }`}
                                  >
                                    <span 
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        hasPermission ? 'translate-x-6' : 'translate-x-1'
                                      }`} 
                                    />
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      
                      <div className="flex justify-end mt-6 space-x-3">
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                        >
                          İptal
                        </button>
                        <button
                          onClick={saveRole}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Değişiklikleri Kaydet
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-750 border-b border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-white">Kullanıcı Rolleri</h2>
                  
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="İsim veya email ara..."
                        className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    <div className="relative">
                      <select
                        className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full md:w-auto"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                      >
                        <option value="all">Tüm Roller</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                      <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kullanıcı</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mevcut Rol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Son Aktif</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Rol Değiştir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-750">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center text-lg font-semibold text-white">
                                  {user.name?.charAt(0) || user.email.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">{user.name || 'İsimsiz Kullanıcı'}</div>
                                  <div className="text-sm text-gray-400">ID: {user.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {(() => {
                                const role = roles.find(r => r.id === user.role);
                                if (!role) return null;
                                
                                return (
                                  <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full bg-${role.color}-500 mr-2`}></div>
                                    <span className="text-sm font-medium">{role.name}</span>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(user.lastActive)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex justify-center">
                                <select
                                  className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={user.role}
                                  onChange={(e) => assignRoleToUser(user.id, e.target.value)}
                                >
                                  {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                            <div className="flex flex-col items-center py-6">
                              <UserCog className="w-12 h-12 text-gray-500 mb-2" />
                              <p>Kullanıcı bulunamadı</p>
                              <p className="text-sm">Arama kriterlerini değiştirerek tekrar deneyin</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ClientLayout>
  );
} 