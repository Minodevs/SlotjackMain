'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ClientLayout from '@/components/ClientLayout';
import { PlusCircle, Trash2, Gift, Copy, Clipboard, Check, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

// Interface for redemption code
interface RedemptionCode {
  id: string;
  code: string;
  pointValue: number;
  isUsed: boolean;
  createdAt: number;
  usedAt?: number;
  usedBy?: string;
  description?: string;
}

export default function CodeManagementPage() {
  const { user, loading } = useAuth();
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [pointValue, setPointValue] = useState(10);
  const [description, setDescription] = useState('');
  const [showGenerateCodeButton, setShowGenerateCodeButton] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Load codes from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCodes = localStorage.getItem('redemptionCodes');
      if (storedCodes) {
        setCodes(JSON.parse(storedCodes));
      }
    }
  }, []);

  // Save codes to local storage whenever codes change
  useEffect(() => {
    if (typeof window !== 'undefined' && codes.length > 0) {
      localStorage.setItem('redemptionCodes', JSON.stringify(codes));
    }
  }, [codes]);

  // Filter codes based on search query
  const filteredCodes = codes.filter(code => 
    code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (code.description && code.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Function to generate a random code
  const generateRandomCode = () => {
    // Generate a random 8-character alphanumeric code (uppercase)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Add new code
  const handleAddCode = () => {
    const codeToAdd = newCode || generateRandomCode();
    
    // Check if code already exists
    if (codes.some(code => code.code === codeToAdd)) {
      toast.error('Bu kod zaten mevcut!');
      return;
    }

    const newCodeObj: RedemptionCode = {
      id: uuidv4(),
      code: codeToAdd,
      pointValue: pointValue,
      isUsed: false,
      createdAt: Date.now(),
      description: description
    };

    setCodes([...codes, newCodeObj]);
    setShowAddCodeModal(false);
    setNewCode('');
    setPointValue(10);
    setDescription('');
    toast.success(`Kod başarıyla oluşturuldu: ${codeToAdd}`);
  };

  // Delete code
  const handleDeleteCode = (id: string) => {
    setCodes(codes.filter(code => code.id !== id));
    toast.success('Kod başarıyla silindi');
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCodeId(id);
        setTimeout(() => setCopiedCodeId(null), 2000);
        toast.success('Kod panoya kopyalandı');
      })
      .catch(() => {
        toast.error('Kod kopyalanamadı');
      });
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center items-center">
          <p>Yükleniyor...</p>
        </div>
      </ClientLayout>
    );
  }

  if (!user || user.rank !== 'admin') {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col justify-center items-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erişim Reddedildi</h1>
          <p>Bu sayfayı görüntülemek için admin yetkiniz olmalıdır.</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Kod Yönetimi</h1>
            <button
              onClick={() => {
                setShowAddCodeModal(true);
                setShowGenerateCodeButton(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Yeni Kod Oluştur
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Kod ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-400 uppercase bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Kod</th>
                    <th className="px-4 py-3">Puan Değeri</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3">Açıklama</th>
                    <th className="px-4 py-3">Oluşturulma Tarihi</th>
                    <th className="px-4 py-3">Kullanıldı</th>
                    <th className="px-4 py-3 rounded-tr-lg">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.length > 0 ? (
                    filteredCodes.map((code) => (
                      <tr key={code.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center">
                            {code.code}
                            <button
                              onClick={() => handleCopyCode(code.code, code.id)}
                              className="ml-2 text-gray-400 hover:text-white"
                              title="Kodu kopyala"
                            >
                              {copiedCodeId === code.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-yellow-400 font-medium">{code.pointValue} JP</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              code.isUsed ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                            }`}
                          >
                            {code.isUsed ? 'Kullanıldı' : 'Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{code.description || '-'}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(code.createdAt)}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {code.isUsed && code.usedAt ? (
                            <div>
                              <div>{formatDate(code.usedAt)}</div>
                              <div className="text-xs">{code.usedBy || 'Bilinmiyor'}</div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Kodu sil"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                        {searchQuery ? 'Arama kriterlerine uygun kod bulunamadı.' : 'Henüz kod oluşturulmamış.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Code Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium mb-2">Toplam Kod</h3>
              <p className="text-3xl font-bold">{codes.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium mb-2">Aktif Kodlar</h3>
              <p className="text-3xl font-bold text-green-400">
                {codes.filter(code => !code.isUsed).length}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium mb-2">Kullanılmış Kodlar</h3>
              <p className="text-3xl font-bold text-red-400">
                {codes.filter(code => code.isUsed).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Code Modal */}
      {showAddCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Yeni Kod Oluştur</h2>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Kod</label>
              <div className="flex">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder={showGenerateCodeButton ? "Otomatik oluşturulacak" : "Kodu girin"}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={showGenerateCodeButton}
                />
                <button
                  onClick={() => setShowGenerateCodeButton(!showGenerateCodeButton)}
                  className="ml-2 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg"
                  title={showGenerateCodeButton ? "Manuel kod gir" : "Otomatik oluştur"}
                >
                  {showGenerateCodeButton ? <Clipboard className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Puan Değeri</label>
              <input
                type="number"
                value={pointValue}
                onChange={(e) => setPointValue(Number(e.target.value))}
                min="1"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-400 mb-2">Açıklama (Opsiyonel)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bu kodla ilgili not"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddCodeModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={handleAddCode}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
} 