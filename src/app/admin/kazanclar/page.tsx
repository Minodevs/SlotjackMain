'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Eye, 
  Trash2, 
  Search, 
  Calendar, 
  Filter, 
  X, 
  Download,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { WinSubmission, getSubmissions, deleteSubmission, addSubmission } from '@/services/SubmissionsService';
import { UserRank } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';

// Custom timestamp implementation to replace Firebase's serverTimestamp
const createTimestamp = () => Date.now();

export default function AdminWinSubmissionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<WinSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<WinSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSponsor, setFilterSponsor] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [uniqueSponsors, setUniqueSponsors] = useState<string[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<WinSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentSubmission, setCurrentSubmission] = useState<Partial<WinSubmission>>({
    userId: "",
    userName: "",
    gameName: "",
    bet: 0,
    winAmount: 0,
    sponsor: "",
    date: new Date().toISOString().split('T')[0],
    imageUrl: "",
    link: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debugging hook to identify any problematic properties
  useEffect(() => {
    // Check for properties that aren't in the WinSubmission interface
    const validProps = ['id', 'userId', 'userName', 'userAvatar', 'gameName', 'bet', 'winAmount', 
                       'sponsor', 'sponsorLogo', 'date', 'link', 'imageUrl', 'timestamp'];
    
    // Output any properties in currentSubmission that aren't in the valid list
    const currentProps = Object.keys(currentSubmission);
    const invalidProps = currentProps.filter(prop => !validProps.includes(prop));
    
    if (invalidProps.length > 0) {
      console.error('Invalid properties found in currentSubmission:', invalidProps);
      
      // Clean up the currentSubmission object by removing invalid properties
      const cleanSubmission = { ...currentSubmission };
      invalidProps.forEach(prop => delete cleanSubmission[prop as keyof typeof cleanSubmission]);
      
      // Update the state with the cleaned object
      setCurrentSubmission(cleanSubmission);
    }
  }, [currentSubmission]);

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (user && user.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    const loadSubmissions = async () => {
      setLoading(true);
      try {
        const data = await getSubmissions();
        setSubmissions(data);
        
        // Extract unique sponsors for filter dropdown
        const sponsors = Array.from(new Set(data.map(s => s.sponsor))).filter(Boolean);
        setUniqueSponsors(sponsors);
        
        setFilteredSubmissions(data);
      } catch (error) {
        console.error('Error loading submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.rank === UserRank.ADMIN) {
      loadSubmissions();
    }

    // Set up event listener for real-time updates
    const handleSubmissionUpdated = () => {
      loadSubmissions();
    };

    window.addEventListener('submission-updated', handleSubmissionUpdated);
    return () => {
      window.removeEventListener('submission-updated', handleSubmissionUpdated);
    };
  }, [user, router]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    if (submissions.length === 0) return;

    let results = [...submissions];

    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        s => 
          s.userName.toLowerCase().includes(term) ||
          s.gameName.toLowerCase().includes(term) ||
          s.sponsor.toLowerCase().includes(term)
      );
    }

    // Apply sponsor filter
    if (filterSponsor) {
      results = results.filter(s => s.sponsor === filterSponsor);
    }

    // Apply date range filter
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      results = results.filter(s => {
        const submissionDate = new Date(s.timestamp);
        return submissionDate >= fromDate;
      });
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      results = results.filter(s => {
        const submissionDate = new Date(s.timestamp);
        return submissionDate <= toDate;
      });
    }

    setFilteredSubmissions(results);
  }, [searchTerm, filterSponsor, filterDateFrom, filterDateTo, submissions]);

  // Add this function to the component just after the useEffect hooks
  useEffect(() => {
    // This effect will run once on component mount to look for any old code that might be causing issues
    // Check for a deeply nested setCurrentSubmission with invalid properties
    const checkForProblematicCode = () => {
      // List of problematic property names that we need to search for in the source code
      const problematicProps = ['playerName', 'amount', 'date: formatDateForInput'];
      
      // This will help us identify if there's code we haven't fixed yet
      const problematicPropsFound = problematicProps.map(prop => {
        // For demonstration, log to console - this would need actual DOM traversal in a real implementation
        if (document.body.innerHTML.includes(prop)) {
          console.error(`Found problematic property: ${prop} - this may be causing build errors`);
          return prop;
        }
        return null;
      }).filter(Boolean);
      
      if (problematicPropsFound.length > 0) {
        console.error('Warning: Found problematic properties that might cause build errors:', problematicPropsFound);
      }
    };
    
    // Call the check function once the component is mounted
    setTimeout(checkForProblematicCode, 1000);
  }, []);

  const handleViewSubmission = (submission: WinSubmission) => {
    setSelectedSubmission(submission);
  };

  const handleDeleteSubmission = async (id: string) => {
    if (window.confirm('Bu paylaşımı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      setIsDeleting(true);
      try {
        await deleteSubmission(id);
        
        // Update local state
        const updatedSubmissions = submissions.filter(s => s.id !== id);
        setSubmissions(updatedSubmissions);
        setFilteredSubmissions(filteredSubmissions.filter(s => s.id !== id));
        
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Silme işlemi sırasında bir hata oluştu.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSponsor('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await getSubmissions();
      setSubmissions(data);
      
      // Re-apply current filters
      let results = [...data];
      
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        results = results.filter(
          s => 
            s.userName.toLowerCase().includes(term) ||
            s.gameName.toLowerCase().includes(term) ||
            s.sponsor.toLowerCase().includes(term)
        );
      }
      
      if (filterSponsor) {
        results = results.filter(s => s.sponsor === filterSponsor);
      }
      
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom);
        results = results.filter(s => {
          const submissionDate = new Date(s.timestamp);
          return submissionDate >= fromDate;
        });
      }
      
      if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999);
        results = results.filter(s => {
          const submissionDate = new Date(s.timestamp);
          return submissionDate <= toDate;
        });
      }
      
      setFilteredSubmissions(results);
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Veriler güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      alert('Dışa aktarılacak veri bulunamadı.');
      return;
    }
    
    // Create CSV content
    const headers = ['Kullanıcı', 'Oyun Adı', 'Bahis', 'Kazanç', 'Sponsor', 'Tarih'];
    const rows = filteredSubmissions.map(s => [
      s.userName,
      s.gameName,
      s.bet.toString(),
      s.winAmount.toString(),
      s.sponsor,
      s.date
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kazanclar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create a new submission with the correct properties
    // Using type Omit<WinSubmission, 'id' | 'timestamp'> to match the addSubmission parameter type
    const submissionData: Omit<WinSubmission, 'id' | 'timestamp'> = {
      userId: currentSubmission.userId || "",
      userName: currentSubmission.userName || "",
      gameName: currentSubmission.gameName || "",
      bet: Number(currentSubmission.bet) || 0,
      winAmount: Number(currentSubmission.winAmount) || 0,
      sponsor: currentSubmission.sponsor || "",
      date: currentSubmission.date || new Date().toISOString().split('T')[0],
      imageUrl: currentSubmission.imageUrl || "",
      link: currentSubmission.link || "",
    };

    // Add the new submission to the database
    addSubmission(submissionData)
      .then((newSubmission) => {
        // Update the local state
        setSubmissions(prev => [newSubmission, ...prev]);
        setFilteredSubmissions(prev => [newSubmission, ...prev]);
        
        // Close the modal and reset the form
        setIsModalOpen(false);
        // Reset with only valid properties
        setCurrentSubmission({
          userId: "",
          userName: "",
          gameName: "",
          bet: 0,
          winAmount: 0,
          sponsor: "",
          date: new Date().toISOString().split('T')[0],
          imageUrl: "",
          link: "",
        });
      })
      .catch((error) => {
        console.error("Error adding submission:", error);
        alert("Kazanç eklenirken bir hata oluştu.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Create a helper function to open the modal with proper initialization
  const openAddModal = () => {
    // Explicitly set only valid properties
    setCurrentSubmission({
      userId: "",
      userName: "",
      gameName: "",
      bet: 0,
      winAmount: 0,
      sponsor: "",
      date: new Date().toISOString().split('T')[0],
      imageUrl: "",
      link: "",
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Create a function to handle the form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for any invalid properties in currentSubmission before submitting
    const validKeys = ['userId', 'userName', 'gameName', 'bet', 'winAmount', 'sponsor', 'date', 'imageUrl', 'link', 'id', 'timestamp'];
    const currentKeys = Object.keys(currentSubmission);
    
    // Find any invalid keys
    const invalidKeys = currentKeys.filter(key => !validKeys.includes(key));
    
    if (invalidKeys.length > 0) {
      console.error('Invalid properties detected:', invalidKeys);
      // Create a clean submission object with only valid properties
      const cleanSubmission: Partial<WinSubmission> = {};
      validKeys.forEach(key => {
        if (key in currentSubmission) {
          // Type assertion to handle dynamic property access
          cleanSubmission[key as keyof WinSubmission] = 
            currentSubmission[key as keyof typeof currentSubmission] as any;
        }
      });
      
      // Update the state with the clean object
      setCurrentSubmission(cleanSubmission);
      
      // Alert the user
      alert('Some invalid properties were detected and removed. Please try submitting again.');
      return;
    }
    
    if (modalMode === 'add') {
      handleAddSubmission(e);
    }
  };

  if (!user) {
    return null; // Don't render anything while checking auth
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="mr-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Kullanıcı Kazançları Yönetimi</h1>
            <div className="ml-auto flex space-x-2">
              <button
                onClick={openAddModal}
                className="p-2 bg-green-600 rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <span className="text-lg mr-1">+</span> Ekle
              </button>
              <button 
                onClick={refreshData}
                className="p-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Kullanıcı, oyun adı veya sponsor ara..."
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <select
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  value={filterSponsor}
                  onChange={(e) => setFilterSponsor(e.target.value)}
                >
                  <option value="">Tüm Sponsorlar</option>
                  {uniqueSponsors.map((sponsor) => (
                    <option key={sponsor} value={sponsor}>
                      {sponsor}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Temizle
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center"
                  disabled={filteredSubmissions.length === 0}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Dışa Aktar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Submissions list */}
          <div className="w-full lg:w-2/3">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              {loading && submissions.length === 0 ? (
                <div className="p-10 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-gray-400">Veriler yükleniyor...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Oyun
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Bahis
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
                      {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission) => (
                          <tr 
                            key={submission.id} 
                            className={`hover:bg-gray-700/50 cursor-pointer ${
                              selectedSubmission?.id === submission.id ? 'bg-blue-900/30' : ''
                            }`}
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                                  {submission.userName.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-white">{submission.userName}</div>
                                  <div className="text-xs text-gray-400">ID: {submission.userId.substring(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {submission.gameName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {submission.bet.toFixed(2)} ₺
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                              {submission.winAmount.toLocaleString()} ₺
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {submission.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewSubmission(submission);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSubmission(submission.id);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors"
                                  disabled={isDeleting}
                                >
                                  {isDeleting && selectedSubmission?.id === submission.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                            {searchTerm || filterSponsor || filterDateFrom || filterDateTo ? (
                              <>
                                <Filter className="w-6 h-6 mx-auto mb-2" />
                                Filtrelenmiş sonuç bulunamadı. Filtrelerinizi değiştirin veya temizleyin.
                              </>
                            ) : (
                              'Henüz paylaşım bulunmamaktadır.'
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Pagination placeholder - can be implemented if needed */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Toplam: {filteredSubmissions.length} kayıt
              </div>
            </div>
          </div>
          
          {/* Detail view */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              {selectedSubmission ? (
                <div>
                  <div className="relative aspect-video bg-black">
                    {selectedSubmission.imageUrl ? (
                      <img
                        src={selectedSubmission.imageUrl}
                        alt={`${selectedSubmission.userName}'in kazancı`}
                        className="w-full h-full object-contain"
                      />
                    ) : selectedSubmission.link && selectedSubmission.link.includes('youtube.com') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedSubmission.link.split('v=')[1]}`}
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
                  
                  <div className="p-5">
                    <h2 className="text-xl font-bold mb-2">{selectedSubmission.gameName}</h2>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg font-medium text-white">
                          {selectedSubmission.userName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-white">{selectedSubmission.userName}</p>
                          <p className="text-xs text-gray-400">{selectedSubmission.date}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-xs text-gray-400">Bahis</p>
                        <p className="font-medium text-white">{selectedSubmission.bet.toFixed(2)} ₺</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-xs text-gray-400">Kazanç</p>
                        <p className="font-medium text-green-400">{selectedSubmission.winAmount.toLocaleString()} ₺</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded mb-4">
                      <p className="text-xs text-gray-400">Sponsor</p>
                      <div className="flex items-center mt-1">
                        {selectedSubmission.sponsorLogo && (
                          <img src={selectedSubmission.sponsorLogo} alt={selectedSubmission.sponsor} className="h-5 mr-2" />
                        )}
                        <p className="font-medium text-white">{selectedSubmission.sponsor}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded mb-4">
                      <p className="text-xs text-gray-400">Kullanıcı ID</p>
                      <p className="font-medium text-white break-all">{selectedSubmission.userId}</p>
                    </div>
                    
                    {(selectedSubmission.link || selectedSubmission.imageUrl) && (
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-xs text-gray-400">Bağlantılar</p>
                        {selectedSubmission.link && (
                          <a 
                            href={selectedSubmission.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-400 hover:text-blue-300 mt-1"
                          >
                            <Eye className="w-4 h-4 mr-1" /> Video Link
                          </a>
                        )}
                        {selectedSubmission.imageUrl && (
                          <a 
                            href={selectedSubmission.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-400 hover:text-blue-300 mt-1"
                          >
                            <Eye className="w-4 h-4 mr-1" /> Görüntü Link
                          </a>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <button
                        onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Siliniyor...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-5 h-5 mr-2" />
                            Bu Paylaşımı Sil
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Detayları Görüntüle</h3>
                  <p className="text-gray-400">
                    Detaylarını görüntülemek için bir kazanç paylaşımı seçin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {modalMode === 'add' ? 'Yeni Kazanç Ekle' : 'Kazancı Düzenle'}
              </h2>
              
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={currentSubmission.userName || ''}
                      onChange={(e) => setCurrentSubmission({...currentSubmission, userName: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Kullanıcı ID</label>
                    <input
                      type="text"
                      value={currentSubmission.userId || ''}
                      onChange={(e) => setCurrentSubmission({...currentSubmission, userId: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Oyun Adı</label>
                    <input
                      type="text"
                      value={currentSubmission.gameName || ''}
                      onChange={(e) => setCurrentSubmission({...currentSubmission, gameName: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Bahis (₺)</label>
                      <input
                        type="number"
                        value={currentSubmission.bet || 0}
                        onChange={(e) => setCurrentSubmission({...currentSubmission, bet: Number(e.target.value)})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Kazanç (₺)</label>
                      <input
                        type="number"
                        value={currentSubmission.winAmount || 0}
                        onChange={(e) => setCurrentSubmission({...currentSubmission, winAmount: Number(e.target.value)})}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Sponsor</label>
                    <input
                      type="text"
                      value={currentSubmission.sponsor || ''}
                      onChange={(e) => setCurrentSubmission({...currentSubmission, sponsor: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tarih</label>
                    <input
                      type="date"
                      value={currentSubmission.date || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCurrentSubmission({...currentSubmission, date: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Görsel URL (isteğe bağlı)</label>
                    <input
                      type="url"
                      value={currentSubmission.imageUrl || ''}
                      onChange={(e) => setCurrentSubmission({...currentSubmission, imageUrl: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Link (isteğe bağlı)</label>
                    <input
                      type="url"
                      value={currentSubmission.link || ''}
                      onChange={(e) => setCurrentSubmission({...currentSubmission, link: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const SubmissionDetails = ({ submission }: { submission: WinSubmission }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-3">Kazanç Detayları</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><span className="font-semibold">Kullanıcı Adı:</span> {submission.userName}</p>
          <p><span className="font-semibold">Oyun:</span> {submission.gameName}</p>
          <p><span className="font-semibold">Tarih:</span> {formatDisplayDate(submission.date)}</p>
          <p><span className="font-semibold">Sponsor:</span> {submission.sponsor}</p>
          <p><span className="font-semibold">Bahis:</span> {submission.bet.toLocaleString()} ₺</p>
          <p><span className="font-semibold">Kazanç:</span> {submission.winAmount.toLocaleString()} ₺</p>
          <p><span className="font-semibold">Kullanıcı ID:</span> {submission.userId}</p>
        </div>
        <div>
          {submission.link && (
            <p>
              <span className="font-semibold">Link:</span>{' '}
              <a 
                href={submission.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {submission.link}
              </a>
            </p>
          )}
          
          {submission.imageUrl && (
            <div className="mt-4">
              <p><span className="font-semibold">Görsel:</span></p>
              <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-w-md">
                <a href={submission.imageUrl} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={submission.imageUrl} 
                    alt="Kazanç kanıtı" 
                    className="w-full h-auto object-contain max-h-64"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/images/placeholder.png'; // Fallback image
                      target.alt = 'Görsel yüklenemedi';
                    }}
                  />
                </a>
                <div className="p-2 text-sm text-center">
                  <a 
                    href={submission.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Görseli yeni sekmede aç
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 