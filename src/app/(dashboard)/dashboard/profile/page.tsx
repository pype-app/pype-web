'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/store/auth';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { compressImage, validateBase64Size } from '@/utils/imageCompression';
import ActivityTimeline, { TimelineEvent } from '@/components/profile/ActivityTimeline';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import { 
  UserCircleIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, refreshUserData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock timeline events - replace with real data from backend
  const timelineEvents: TimelineEvent[] = [
    ...(user?.createdAt ? [{
      id: '1',
      type: 'account_created' as const,
      title: 'Account created',
      description: 'Welcome to Pype!',
      timestamp: new Date(user.createdAt),
    }] : []),
    ...(user?.lastLoginAt ? [{
      id: '2',
      type: 'login' as const,
      title: 'Last login',
      description: 'Logged in successfully',
      timestamp: new Date(user.lastLoginAt),
    }] : []),
  ];

  // Load user data on mount
  useEffect(() => {
    refreshUserData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
      setProfileImage(user.profileImageData || null);
    }
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB original)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      try {
        // Compress image
        const compressed = await compressImage(file, 200, 200, 0.8);
        
        // Validate compressed size (max 500KB)
        if (!validateBase64Size(compressed, 500)) {
          toast.error('Compressed image is still too large. Try a simpler image.');
          return;
        }
        
        setImageFile(file);
        setProfileImage(compressed);
        toast.success('Image ready to upload');
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Error processing image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.put('/api/auth/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        profileImageData: profileImage !== user?.profileImageData ? profileImage : undefined,
      });
      
      toast.success('Profile updated successfully');
      await refreshUserData();
      setImageFile(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Error updating profile';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = (role: number) => {
    switch (role) {
      case 3: return 'Owner';
      case 2: return 'Admin';
      case 1: return 'User';
      case 0: return 'Viewer';
      default: return 'Unknown';
    }
  };

  const getRoleBadgeColor = (role: number) => {
    switch (role) {
      case 3: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 2: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 0: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage your personal information, profile picture, and security settings
        </p>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Image & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Image */}
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Profile Picture
            </h2>
            
            <div className="flex flex-col items-center">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-700"
                  />
                ) : (
                  <UserCircleIcon className="h-32 w-32 text-gray-400 dark:text-gray-500" />
                )}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <CameraIcon className="h-5 w-5" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                JPG, PNG or GIF. Max 5MB.<br />
                Auto-compressed to 200x200px
              </p>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role || 0)}`}>
                    {getRoleText(user?.role || 0)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tenant</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.tenant?.name || 'N/A'}</p>
                </div>
              </div>
              
              {user?.createdAt && (
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Member since</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              )}
              
              {user?.lastLoginAt && (
                <div className="flex items-start gap-3 text-sm">
                  <ClockIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Last login</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(user.lastLoginAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <ActivityTimeline events={timelineEvents} />
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2">
          {/* Personal Information Form */}
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Personal Information
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Email cannot be changed. Contact an administrator if you need to update it.
                </p>
              </div>

              <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <KeyIcon className="h-4 w-4" />
                  Change Password
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        setFormData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          email: user.email || '',
                        });
                        setProfileImage(user.profileImageData || null);
                        setImageFile(null);
                      }
                    }}
                    className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
