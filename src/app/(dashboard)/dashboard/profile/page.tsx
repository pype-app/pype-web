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
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [loadingTimeline, setLoadingTimeline] = useState(false);

    // Load user data and timeline on mount
    useEffect(() => {
        refreshUserData();
        loadTimelineData();
    }, []);

    const loadTimelineData = async () => {
        setLoadingTimeline(true);
        try {
            // Fetch audit logs for user activities
            const response = await apiClient.get('/api/audit-logs', {
                params: {
                    pageSize: 10,
                    pageNumber: 1,
                }
            });

            const events: TimelineEvent[] = [];

            // Add account creation
            if (user?.createdAt) {
                events.push({
                    id: 'account_created',
                    type: 'account_created',
                    title: 'Account created',
                    description: 'Welcome to Pype!',
                    timestamp: new Date(user.createdAt),
                });
            }

            // Add last login
            if (user?.lastLoginAt) {
                events.push({
                    id: 'last_login',
                    type: 'login',
                    title: 'Last login',
                    description: 'Logged in successfully',
                    timestamp: new Date(user.lastLoginAt),
                });
            }

            // Parse audit logs
            if (response.items && Array.isArray(response.items)) {
                response.items.forEach((log: any) => {
                    const action = log.action?.toLowerCase() || '';
                    const entityType = log.entityType?.toLowerCase() || '';
                    
                    // Pipeline activities
                    if (entityType === 'pipeline') {
                        if (action.includes('create')) {
                            events.push({
                                id: `log_${log.id}`,
                                type: 'pipeline_created',
                                title: 'Pipeline created',
                                description: `Created "${log.entityName || 'Pipeline'}"`,
                                timestamp: new Date(log.timestamp),
                            });
                        } else if (action.includes('start') || action.includes('run')) {
                            events.push({
                                id: `log_${log.id}`,
                                type: 'pipeline_started',
                                title: 'Pipeline started',
                                description: `Started "${log.entityName || 'Pipeline'}"`,
                                timestamp: new Date(log.timestamp),
                            });
                        } else if (action.includes('pause') || action.includes('stop')) {
                            events.push({
                                id: `log_${log.id}`,
                                type: 'pipeline_paused',
                                title: 'Pipeline paused',
                                description: `Paused "${log.entityName || 'Pipeline'}"`,
                                timestamp: new Date(log.timestamp),
                            });
                        } else if (action.includes('delete')) {
                            events.push({
                                id: `log_${log.id}`,
                                type: 'pipeline_deleted',
                                title: 'Pipeline deleted',
                                description: `Deleted "${log.entityName || 'Pipeline'}"`,
                                timestamp: new Date(log.timestamp),
                            });
                        }
                    }

                    // Profile activities
                    if (entityType === 'user' && log.performedByUserId === user?.id) {
                        if (action.includes('update')) {
                            events.push({
                                id: `log_${log.id}`,
                                type: 'profile_updated',
                                title: 'Profile updated',
                                description: 'Updated profile information',
                                timestamp: new Date(log.timestamp),
                            });
                        } else if (action.includes('password')) {
                            events.push({
                                id: `log_${log.id}`,
                                type: 'password_changed',
                                title: 'Password changed',
                                description: 'Updated account password',
                                timestamp: new Date(log.timestamp),
                            });
                        }
                    }
                });
            }

            // Sort by most recent first
            events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setTimelineEvents(events);
        } catch (error) {
            console.error('Error loading timeline:', error);
            // Fallback to basic events on error
            const fallbackEvents: TimelineEvent[] = [];
            if (user?.createdAt) {
                fallbackEvents.push({
                    id: 'account_created',
                    type: 'account_created',
                    title: 'Account created',
                    description: 'Welcome to Pype!',
                    timestamp: new Date(user.createdAt),
                });
            }
            if (user?.lastLoginAt) {
                fallbackEvents.push({
                    id: 'last_login',
                    type: 'login',
                    title: 'Last login',
                    description: 'Logged in successfully',
                    timestamp: new Date(user.lastLoginAt),
                });
            }
            setTimelineEvents(fallbackEvents);
        } finally {
            setLoadingTimeline(false);
        }
    };

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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Personal Information Form with Profile Picture - 8 columns */}
                <div className="lg:col-span-10 bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                        Personal Information
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Profile Picture Section - 1 column */}
                            <div className="md:col-span-1 flex flex-col items-center">
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
                                    JPG, PNG or GIF.<br />Max 5MB.
                                </p>
                            </div>

                            {/* Form Fields - 3 columns */}
                            <div className="md:col-span-3 space-y-6">
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
                            </div>
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

                {/* Account Info Card - 4 columns */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6 text-center">
                        Account Information
                    </h2>

                    <div className="space-y-4">
                        {user?.createdAt && (
                            <div className="flex flex-col items-center gap-1 text-sm text-center">
                                <CheckCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <p className="text-gray-500 dark:text-gray-400 text-xs">Member since</p>
                                <p className="font-medium text-gray-900 dark:text-white text-xs">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}

                        {user?.lastLoginAt && (
                            <div className="flex flex-col items-center gap-1 text-sm text-center">
                                <ClockIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <p className="text-gray-500 dark:text-gray-400 text-xs">Last login</p>
                                <p className="font-medium text-gray-900 dark:text-white text-xs">
                                    {new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        )}                        
                        <div className='flex flex-row items-center justify-center gap-6'>
                            <div className="flex flex-col items-center gap-1 text-sm text-center">
                                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <p className="text-gray-500 dark:text-gray-400 text-xs">Tenant</p>
                                <p className="font-medium text-gray-900 dark:text-white">{user?.tenant?.name || 'N/A'}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role || 0)}`}>
                                    {getRoleText(user?.role || 0)}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Activity Timeline - Full Width Centered */}
            <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6 text-center">
                    Recent Activity
                </h2>
                <div className="flex justify-center">
                    <div className="w-full max-w-3xl">
                        {loadingTimeline ? (
                            <div className="text-center py-8">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading activities...</p>
                            </div>
                        ) : (
                            <ActivityTimeline events={timelineEvents} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
