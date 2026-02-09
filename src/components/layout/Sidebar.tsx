'use client';

import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { ROUTES } from '@/constants';
import {
  HomeIcon,
  CircleStackIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  KeyIcon,
  ComputerDesktopIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: HomeIcon },
  {
    name: 'Pipelines',
    icon: CircleStackIcon,
    children: [
      { name: 'Environment & Secrets', href: ROUTES.ENVIRONMENT, icon: KeyIcon },
      { name: 'Create Pipeline', href: ROUTES.PIPELINE_CREATE, icon: PlusCircleIcon },
      { name: 'Pipelines', href: ROUTES.PIPELINES, icon: CircleStackIcon },
    ],
  },
  {
    name: 'Monitor',
    icon: ComputerDesktopIcon,
    children: [
      { name: 'Analytics', href: ROUTES.ANALYTICS, icon: ChartBarIcon },
      { name: 'Executions & Logs', href: ROUTES.EXECUTIONS, icon: DocumentTextIcon },
      { name: 'Dead Letter Queue', href: ROUTES.DLQ_ADMIN, icon: ExclamationCircleIcon },
    ],
  },
  {
    name: 'Administration',
    icon: WrenchScrewdriverIcon,
    children: [
      { name: 'Users', href: ROUTES.USERS, icon: UsersIcon },
      // { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon }, // Oculto temporariamente para MVP
    ],
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.href) {
      return pathname === item.href;
    }
    return item.children?.some(child => pathname === child.href) || false;
  };

  const isChildActive = (child: NavigationItem): boolean => {
    return pathname === child.href;
  };

  // Auto-expand active parent items
  React.useEffect(() => {
    navigation.forEach(item => {
      if (item.children && isItemActive(item) && !expandedItems.includes(item.name)) {
        setExpandedItems(prev => [...prev, item.name]);
      }
    });
  }, [pathname]);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <Link href="/dashboard" className="flex items-center" onClick={mobile ? () => setSidebarOpen(false) : undefined}>
          <img 
            src="/logo.png" 
            alt="Pype Logo" 
            className="h-8 w-8"
          />
          <span className="ml-3 text-xl font-bold text-gray-900 dark:text-gray-100">Pype</span>
        </Link>
        {mobile && (
          <button
            type="button"
            className="ml-auto -m-2.5 p-2.5 text-gray-700 dark:text-gray-300"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    // Parent item with children
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={classNames(
                          isItemActive(item)
                            ? 'bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700',
                          'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            isItemActive(item) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        <span className="flex-1 text-left">{item.name}</span>
                        {expandedItems.includes(item.name) ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                      
                      {expandedItems.includes(item.name) && (
                        <ul className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <Link
                                href={child.href!}
                                onClick={mobile ? () => setSidebarOpen(false) : undefined}
                                className={classNames(
                                  isChildActive(child)
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                                )}
                              >
                                <child.icon
                                  className={classNames(
                                    isChildActive(child) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400',
                                    'h-5 w-5 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Single item without children
                    <Link
                      href={item.href!}
                      onClick={mobile ? () => setSidebarOpen(false) : undefined}
                      className={classNames(
                        isItemActive(item)
                          ? 'bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          isItemActive(item) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <SidebarContent mobile />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
}