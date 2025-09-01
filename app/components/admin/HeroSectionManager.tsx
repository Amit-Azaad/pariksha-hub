import React, { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';

interface HeroSection {
  id: number;
  imageUrl: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

interface HeroSectionManagerProps {
  onClose?: () => void;
}

export default function HeroSectionManager({ onClose }: HeroSectionManagerProps) {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSection, setEditingSection] = useState<HeroSection | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    imageFile: null as File | null
  });
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const fetcher = useFetcher();

  // Load hero sections
  useEffect(() => {
    loadHeroSections();
  }, []);

  const loadHeroSections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hero-sections');
      const data = await response.json();
      if (data.heroSections) {
        setHeroSections(data.heroSections);
      }
    } catch (error) {
      console.error('Failed to load hero sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, or SVG)');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Show file info
      setUploadProgress(`Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadProgress('');
      setImagePreview('');
      setFormData(prev => ({ ...prev, imageFile: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      alert('Please enter hero text');
      return;
    }

    if (!formData.imageFile && !editingSection) {
      alert('Please select an image');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Uploading...');

    const submitData = new FormData();
    submitData.append('text', formData.text);
    if (formData.imageFile) {
      submitData.append('image', formData.imageFile);
    }
    if (editingSection) {
      submitData.append('id', editingSection.id.toString());
    }

    try {
      const response = await fetch('/api/hero-sections', {
        method: editingSection ? 'PUT' : 'POST',
        body: submitData
      });

      const result = await response.json();
      if (result.error) {
        alert(`Error: ${result.error}`);
        setUploadProgress('');
      } else {
        alert(editingSection ? 'Hero section updated successfully!' : 'Hero section created successfully!');
        setFormData({ text: '', imageFile: null });
        setEditingSection(null);
        setShowAddForm(false);
        setUploadProgress('');
        setImagePreview('');
        loadHeroSections();
      }
    } catch (error) {
      console.error('Error saving hero section:', error);
      alert('Failed to save hero section. Please try again.');
      setUploadProgress('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (section: HeroSection) => {
    setEditingSection(section);
    setFormData({ text: section.text, imageFile: null });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hero section?')) {
      return;
    }

    try {
      const response = await fetch(`/api/hero-sections/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert('Hero section deleted successfully!');
        loadHeroSections();
      }
    } catch (error) {
      console.error('Error deleting hero section:', error);
      alert('Failed to delete hero section');
    }
  };

  const handleCancel = () => {
    setFormData({ text: '', imageFile: null });
    setEditingSection(null);
    setShowAddForm(false);
    setUploadProgress('');
    setImagePreview('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Manage Hero Sections
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Upload and manage hero section images and text. Images are stored locally for better performance.
        </p>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            {editingSection ? 'Edit Hero Section' : 'Add New Hero Section'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Text *
              </label>
              <input
                type="text"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter hero section text"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Image {!editingSection && '*'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required={!editingSection}
                disabled={isSubmitting}
              />
              {uploadProgress && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {uploadProgress}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB. Recommended: 1200x400px
              </p>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                  <div className="relative w-full h-32 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Uploading...' : (editingSection ? 'Update Hero Section' : 'Create Hero Section')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!showAddForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Hero Section
          </button>
        </div>
      )}

      {/* Hero Sections List */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">
          Current Hero Sections ({heroSections.length})
        </h4>
        
        {isLoading ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Loading hero sections...
          </div>
        ) : heroSections.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hero sections found. Add your first hero section above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heroSections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={section.imageUrl}
                    alt="Hero section"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <p className="text-white text-sm font-medium text-center px-2">
                      {section.text}
                    </p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {section.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Created: {new Date(section.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(section)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
