'use client';

import { useState, useEffect } from 'react';
import { X, Award, Star, Trophy, AlertCircle } from 'lucide-react';
import { UserAward, AwardType } from '@/types/user';

interface AwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (award: UserAward) => void;
  userId: string;
  editAward: UserAward | null;
}

export default function AwardModal({ isOpen, onClose, onSave, userId, editAward }: AwardModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    userId: userId,
    type: 'achievement' as AwardType,
    title: '',
    description: '',
    icon: 'award',
    color: '#FF6B00', // Default orange color
    createdAt: new Date().toISOString(),
  });
  
  const [errors, setErrors] = useState({
    title: '',
    description: '',
  });

  // Reset form or populate with award data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editAward) {
        // Edit mode - populate form with award data
        setFormData({
          id: editAward.id,
          userId: editAward.userId,
          type: editAward.type,
          title: editAward.title,
          description: editAward.description,
          icon: editAward.icon,
          color: editAward.color,
          createdAt: editAward.createdAt,
        });
      } else {
        // Create mode - reset form with defaults
        setFormData({
          id: crypto.randomUUID(), // Generate a new UUID
          userId: userId,
          type: 'achievement',
          title: '',
          description: '',
          icon: 'award',
          color: '#FF6B00',
          createdAt: new Date().toISOString(),
        });
      }
      setErrors({ title: '', description: '' });
    }
  }, [isOpen, editAward, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleIconSelect = (icon: string) => {
    setFormData((prev) => ({ ...prev, icon }));
  };

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
    };
    
    if (!formData.title.trim()) {
      newErrors.title = 'Ödül başlığı gereklidir';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Ödül açıklaması gereklidir';
    }
    
    setErrors(newErrors);
    return !newErrors.title && !newErrors.description;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        // Ensure dates are properly formatted
        createdAt: editAward ? formData.createdAt : new Date().toISOString(),
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-xl font-semibold">
            {editAward ? 'Ödülü Düzenle' : 'Yeni Ödül Ekle'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Ödül Türü</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="achievement">Başarı</option>
              <option value="medal">Madalya</option>
              <option value="trophy">Ödül</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Başlık</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Örn: İlk Katılım"
              className={`w-full bg-gray-700 border ${errors.title ? 'border-red-500' : 'border-gray-600'} rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.title}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Açıklama</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Örn: Platformumuza ilk katılımınız"
              rows={3}
              className={`w-full bg-gray-700 border ${errors.description ? 'border-red-500' : 'border-gray-600'} rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.description}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">İkon</label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => handleIconSelect('award')}
                className={`p-3 rounded-full ${formData.icon === 'award' ? 'bg-orange-500/20 border-2 border-orange-500' : 'bg-gray-700 border border-gray-600'}`}
              >
                <Award className={`h-6 w-6 ${formData.icon === 'award' ? 'text-orange-500' : 'text-gray-300'}`} />
              </button>
              <button
                type="button"
                onClick={() => handleIconSelect('star')}
                className={`p-3 rounded-full ${formData.icon === 'star' ? 'bg-orange-500/20 border-2 border-orange-500' : 'bg-gray-700 border border-gray-600'}`}
              >
                <Star className={`h-6 w-6 ${formData.icon === 'star' ? 'text-orange-500' : 'text-gray-300'}`} />
              </button>
              <button
                type="button"
                onClick={() => handleIconSelect('trophy')}
                className={`p-3 rounded-full ${formData.icon === 'trophy' ? 'bg-orange-500/20 border-2 border-orange-500' : 'bg-gray-700 border border-gray-600'}`}
              >
                <Trophy className={`h-6 w-6 ${formData.icon === 'trophy' ? 'text-orange-500' : 'text-gray-300'}`} />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Renk</label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => handleColorSelect('#FF6B00')}
                className={`w-8 h-8 rounded-full bg-[#FF6B00] ${formData.color === '#FF6B00' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
              />
              <button
                type="button"
                onClick={() => handleColorSelect('#FFD700')}
                className={`w-8 h-8 rounded-full bg-[#FFD700] ${formData.color === '#FFD700' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
              />
              <button
                type="button"
                onClick={() => handleColorSelect('#C0C0C0')}
                className={`w-8 h-8 rounded-full bg-[#C0C0C0] ${formData.color === '#C0C0C0' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
              />
              <button
                type="button"
                onClick={() => handleColorSelect('#CD7F32')}
                className={`w-8 h-8 rounded-full bg-[#CD7F32] ${formData.color === '#CD7F32' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
              />
              <button
                type="button"
                onClick={() => handleColorSelect('#4CAF50')}
                className={`w-8 h-8 rounded-full bg-[#4CAF50] ${formData.color === '#4CAF50' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
              />
              <button
                type="button"
                onClick={() => handleColorSelect('#2196F3')}
                className={`w-8 h-8 rounded-full bg-[#2196F3] ${formData.color === '#2196F3' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
              />
            </div>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              placeholder="#RRGGBB"
              className="mt-2 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="flex border-t border-gray-700 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md mr-2 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              {editAward ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 