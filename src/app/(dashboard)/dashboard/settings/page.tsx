'use client';

import { useState } from 'react';
import { 
  BuildingOfficeIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const settingsTabs = [
  { name: 'Tenant', href: '#tenant', icon: BuildingOfficeIcon, current: true },
  { name: 'Profile', href: '#profile', icon: UserIcon, current: false },
  { name: 'Notifications', href: '#notifications', icon: BellIcon, current: false },
  { name: 'Security', href: '#security', icon: ShieldCheckIcon, current: false },
  { name: 'API Keys', href: '#api-keys', icon: Cog6ToothIcon, current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('tenant');

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your account and application preferences
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Sidebar */}
        <aside className="py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
          <nav className="space-y-1">
            {settingsTabs.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name.toLowerCase())}
                className={classNames(
                  activeTab === item.name.toLowerCase()
                    ? 'bg-gray-50 text-blue-700 hover:text-blue-700 hover:bg-gray-50'
                    : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50',
                  'group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left'
                )}
              >
                <item.icon
                  className={classNames(
                    activeTab === item.name.toLowerCase()
                      ? 'text-blue-500 group-hover:text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500',
                    'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
          {/* Tenant Settings */}
          {activeTab === 'tenant' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Tenant Information
                </h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="tenant-name" className="block text-sm font-medium leading-6 text-gray-900">
                        Tenant Name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="tenant-name"
                          id="tenant-name"
                          defaultValue="Acme Corporation"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="tenant-domain" className="block text-sm font-medium leading-6 text-gray-900">
                        Domain
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="tenant-domain"
                          id="tenant-domain"
                          defaultValue="acme.com"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tenant-description" className="block text-sm font-medium leading-6 text-gray-900">
                      Description
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="tenant-description"
                        name="tenant-description"
                        rows={3}
                        defaultValue="Leading technology company focused on data integration solutions."
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Profile Information
                </h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                        First Name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          defaultValue="John"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                        Last Name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="last-name"
                          id="last-name"
                          defaultValue="Doe"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                      Email Address
                    </label>
                    <div className="mt-2">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        defaultValue="john.doe@acme.com"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-6">
                  <fieldset>
                    <legend className="text-sm font-medium leading-6 text-gray-900">Pipeline Events</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="notify-success"
                            name="notify-success"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="notify-success" className="font-medium text-gray-900">
                            Successful executions
                          </label>
                          <p className="text-gray-500">Get notified when pipelines complete successfully.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="notify-failure"
                            name="notify-failure"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="notify-failure" className="font-medium text-gray-900">
                            Failed executions
                          </label>
                          <p className="text-gray-500">Get notified when pipeline executions fail.</p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                  
                  <fieldset>
                    <legend className="text-sm font-medium leading-6 text-gray-900">Delivery Methods</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="email-notifications"
                            name="email-notifications"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="email-notifications" className="font-medium text-gray-900">
                            Email notifications
                          </label>
                          <p className="text-gray-500">Receive notifications via email.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="browser-notifications"
                            name="browser-notifications"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="browser-notifications" className="font-medium text-gray-900">
                            Browser notifications
                          </label>
                          <p className="text-gray-500">Show notifications in your browser.</p>
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Security Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium leading-6 text-gray-900">
                          Current Password
                        </label>
                        <div className="mt-2">
                          <input
                            type="password"
                            name="current-password"
                            id="current-password"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium leading-6 text-gray-900">
                          New Password
                        </label>
                        <div className="mt-2">
                          <input
                            type="password"
                            name="new-password"
                            id="new-password"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-gray-900">
                          Confirm New Password
                        </label>
                        <div className="mt-2">
                          <input
                            type="password"
                            name="confirm-password"
                            id="confirm-password"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === 'api keys' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    API Keys
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    Generate New Key
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Production API Key</h4>
                        <p className="text-sm text-gray-500">Created on January 15, 2024</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                          pk_live_51H...7vA2
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800">Regenerate</button>
                        <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Development API Key</h4>
                        <p className="text-sm text-gray-500">Created on January 10, 2024</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                          pk_test_51H...9kB1
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800">Regenerate</button>
                        <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}