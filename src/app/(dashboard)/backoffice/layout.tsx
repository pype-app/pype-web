'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { ROUTES } from '@/constants';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

const tabs = [
  { name: 'Overview', href: ROUTES.BACKOFFICE_DASHBOARD, icon: ChartBarIcon },
  { name: 'Customers', href: ROUTES.BACKOFFICE_CUSTOMERS, icon: UsersIcon },
  { name: 'Tenants', href: ROUTES.BACKOFFICE_TENANTS, icon: BuildingOffice2Icon },
  { name: 'Users', href: ROUTES.BACKOFFICE_USERS, icon: UsersIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasPlatformAccess = useAuthStore((state) => state.user?.platformAccess ?? false);

  useEffect(() => {
    if (!hasPlatformAccess) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [hasPlatformAccess, router]);

  if (!hasPlatformAccess) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Backoffice</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Platform-level administration — tenants, customers, and health metrics.
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Backoffice tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={classNames(
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300',
                  'group inline-flex items-center gap-x-2 border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap'
                )}
              >
                <tab.icon
                  className={classNames(
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                    'h-5 w-5'
                  )}
                />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
