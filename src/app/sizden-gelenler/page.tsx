'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ClientLayout from '@/components/ClientLayout';
import { Plus, X, Maximize, Volume2, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { getSponsors, Sponsor } from '@/services/SponsorsService';
import { 
  WinSubmission, 
  getSubmissions, 
  addSubmission, 
  updateSubmission, 
  deleteSubmission,
  syncLocalStorageWithDatabase
} from '@/services/SubmissionsService';

export default function UserSubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<WinSubmission[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    gameName: '',
    bet: '',
    winAmount: '',
    sponsor: '',
    link: '',
    imageUrl: ''
  });
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedWin, setSelectedWin] = useState<WinSubmission | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load sponsors and submissions
    const loadData = async () => {
      setLoading(true);
      try {
        // Load sponsors
        const sponsorData = getSponsors();
        const activeSponsors = sponsorData.filter(sponsor => 
          sponsor.isActive !== false
        );
        setSponsors(activeSponsors);
        
        // Sync localStorage with database (for existing data)
        await syncLocalStorageWithDatabase();
        
        // Load submissions from database
        const submissionsData = await getSubmissions();
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for updates from other tabs/windows
    const handleStorageChange = () => {
      getSubmissions().then(setSubmissions).catch(console.error);
    };

    window.addEventListener('submission-updated', handleStorageChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'slotjack_win_submissions') {
        handleStorageChange();
      }
    });

    return () => {
      window.removeEventListener('submission-updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      // Find the sponsor logo if available
      const selectedSponsor = sponsors.find(s => s.name === formData.sponsor);
      
      if (isEditing && formData.id) {
        // Update existing submission
        const updatedSubmission: WinSubmission = {
          id: formData.id,
          userId: user.id,
          userName: user.name || user.email.split('@')[0],
          userAvatar: user.avatar,
          gameName: formData.gameName,
          bet: parseFloat(formData.bet),
          winAmount: parseFloat(formData.winAmount),
          sponsor: formData.sponsor,
          sponsorLogo: selectedSponsor?.logo,
          date: new Date().toLocaleDateString('tr-TR'),
          link: formData.link,
          imageUrl: formData.imageUrl,
          timestamp: Date.now() // Update timestamp
        };
        
        await updateSubmission(updatedSubmission);
        
        // Update local state
        setSubmissions(prevSubmissions => 
          prevSubmissions.map(submission => 
            submission.id === formData.id ? updatedSubmission : submission
          )
        );
        
        setIsEditing(false);
      } else {
        // Create new submission
        const newSubmissionData = {
          userId: user.id,
          userName: user.name || user.email.split('@')[0],
          userAvatar: user.avatar,
          gameName: formData.gameName,
          bet: parseFloat(formData.bet),
          winAmount: parseFloat(formData.winAmount),
          sponsor: formData.sponsor,
          sponsorLogo: selectedSponsor?.logo,
          date: new Date().toLocaleDateString('tr-TR'),
          link: formData.link,
          imageUrl: formData.imageUrl
        };
        
        const newSubmission = await addSubmission(newSubmissionData);
        
        // Update local state with the new submission
        setSubmissions(prevSubmissions => [newSubmission, ...prevSubmissions]);
      }
      
      setShowSubmitForm(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      gameName: '',
      bet: '',
      winAmount: '',
      sponsor: '',
      link: '',
      imageUrl: ''
    });
  };

  const handleEditSubmission = (submission: WinSubmission) => {
    if (!user) return;
    if (user.id !== submission.userId) {
      alert('Sadece kendi paylaşımlarınızı düzenleyebilirsiniz.');
      return;
    }
    
    setFormData({
      id: submission.id,
      gameName: submission.gameName,
      bet: submission.bet.toString(),
      winAmount: submission.winAmount.toString(),
      sponsor: submission.sponsor,
      link: submission.link || '',
      imageUrl: submission.imageUrl || ''
    });
    setIsEditing(true);
    setShowSubmitForm(true);
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!user) return;
    
    const submission = submissions.find(s => s.id === id);
    if (!submission || user.id !== submission.userId) {
      alert('Sadece kendi paylaşımlarınızı silebilirsiniz.');
      return;
    }
    
    if (window.confirm('Bu kazanç paylaşımını silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        await deleteSubmission(id);
        
        // Update local state
        setSubmissions(submissions.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Silme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewWin = (submission: WinSubmission) => {
    setSelectedWin(submission);
    setShowWinModal(true);
  };

  const openFullscreen = () => {
    const elem = document.getElementById('win-image');
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }
  };
  
  const handleShareButtonClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      setShowSubmitForm(true);
    }
  };

  const isUserOwner = (submission: WinSubmission) => {
    return user && user.id === submission.userId;
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Sizden Gelenler</h1>
            <p className="text-gray-400">Sizlerden gelen kazanç videolarını burada paylaşıyoruz.</p>
          </div>
          <button
            onClick={handleShareButtonClick}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
            Kazancını Paylaş
          </button>
        </div>

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex items-center text-amber-500 mb-4">
                <AlertTriangle className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Giriş Gerekli</h2>
              </div>
              <p className="text-gray-300 mb-6">
                Kazançlarınızı paylaşabilmek için lütfen giriş yapın. Giriş yaptıktan sonra kazançlarınızı paylaşabilirsiniz.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                >
                  Kapat
                </button>
                <a
                  href="/giris"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Giriş Yap
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Submission Form Modal */}
        {showSubmitForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold text-white mb-4">
                {isEditing ? 'Kazanç Paylaşımını Düzenle' : 'Kazancınızı Paylaşın'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">Oyun Adı</label>
                  <input
                    type="text"
                    placeholder="Oyun Adı Yazınız"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                    value={formData.gameName}
                    onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Bahis</label>
                  <input
                    type="number"
                    placeholder="Bahsinizi Yazınız"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                    value={formData.bet}
                    onChange={(e) => setFormData({ ...formData, bet: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Kazanç</label>
                  <input
                    type="number"
                    placeholder="Kazancınızı Yazınız"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                    value={formData.winAmount}
                    onChange={(e) => setFormData({ ...formData, winAmount: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Sponsor</label>
                  <select
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                    value={formData.sponsor}
                    onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                    required
                    disabled={submitting}
                  >
                    <option value="">Seçiniz</option>
                    {sponsors.map((sponsor) => (
                      <option key={sponsor.id} value={sponsor.name}>
                        {sponsor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Görüntü URL</label>
                  <input
                    type="text"
                    placeholder="Kazanç görüntüsü için bir URL ekleyin"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Video Link</label>
                  <input
                    type="text"
                    placeholder="Kazanç linkinizi yapıştırınız"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitForm(false);
                      setIsEditing(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                    disabled={submitting}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditing ? 'Güncelleniyor...' : 'Paylaşılıyor...'}
                      </>
                    ) : (
                      isEditing ? 'Güncelle' : 'Paylaş'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Win View Modal */}
        {showWinModal && selectedWin && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative w-full max-w-4xl">
              <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white">{selectedWin.gameName}</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={openFullscreen}
                      className="text-gray-400 hover:text-white p-1 rounded bg-gray-800 hover:bg-gray-700"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowWinModal(false)}
                      className="text-gray-400 hover:text-white p-1 rounded bg-gray-800 hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="relative aspect-video bg-black">
                  {selectedWin.imageUrl ? (
                    <img
                      id="win-image"
                      src={selectedWin.imageUrl}
                      alt={`${selectedWin.userName}'in kazancı`}
                      className="w-full h-full object-contain"
                    />
                  ) : selectedWin.link && selectedWin.link.includes('youtube.com') ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedWin.link.split('v=')[1]}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400">Görüntü yok</p>
                    </div>
                  )}
                </div>
                <div className="p-5 bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg font-medium text-white">
                        {selectedWin.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{selectedWin.userName}</p>
                        <p className="text-sm text-gray-400">{selectedWin.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Bahis</p>
                        <p className="font-medium text-white">{selectedWin.bet.toFixed(2)} ₺</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Kazanç</p>
                        <p className="font-medium text-green-400">{selectedWin.winAmount.toLocaleString()} ₺</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {selectedWin.sponsorLogo && (
                        <img src={selectedWin.sponsorLogo} alt={selectedWin.sponsor} className="h-6 mr-2" />
                      )}
                      <span className="text-gray-300">{selectedWin.sponsor}</span>
                    </div>
                    {isUserOwner(selectedWin) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setShowWinModal(false);
                            handleEditSubmission(selectedWin);
                          }}
                          className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Düzenle
                        </button>
                        <button
                          onClick={() => {
                            setShowWinModal(false);
                            handleDeleteSubmission(selectedWin.id);
                          }}
                          className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          {loading && submissions.length === 0 ? (
            <div className="p-10 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-gray-400">Veriler yükleniyor...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Paylaşan Üyemiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Oyun Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Bet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Sponsor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Kazanç
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                              {submission.userName.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{submission.userName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {submission.gameName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {submission.bet.toFixed(2)} ₺
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {submission.sponsorLogo ? (
                              <img 
                                src={submission.sponsorLogo} 
                                alt={submission.sponsor} 
                                className="h-5 mr-2"
                              />
                            ) : null}
                            <span className="text-sm text-white">{submission.sponsor}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                          {submission.winAmount.toLocaleString()} ₺
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {submission.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {(submission.link || submission.imageUrl) && (
                              <button
                                onClick={() => handleViewWin(submission)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                İzle
                              </button>
                            )}
                            {isUserOwner(submission) && (
                              <>
                                <button
                                  onClick={() => handleEditSubmission(submission)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm transition-colors"
                                  disabled={loading}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubmission(submission.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                                  disabled={loading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                        Henüz paylaşım bulunmamaktadır. İlk paylaşımı siz yapın!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 