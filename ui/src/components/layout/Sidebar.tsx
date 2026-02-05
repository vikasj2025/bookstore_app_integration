import React, { Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Dialog, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import {
  HomeIcon,
  CogIcon,
  ChartBarIcon,
  CloudArrowDownIcon,
  ServerStackIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
  },
  {
    name: 'Configuration',
    href: '/configuration',
    icon: CogIcon,
  },
  {
    name: 'Monitoring',
    href: '/monitoring',
    icon: ChartBarIcon,
  },
  {
    name: 'Downloads',
    href: '/downloads',
    icon: CloudArrowDownIcon,
  },
  {
    name: 'Cache Management',
    href: '/cache',
    icon: ServerStackIcon,
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  mobile?: boolean;
}

function NavigationItem({ item, mobile = false }: { item: NavigationItem; mobile?: boolean }) {
  const router = useRouter();
  const isActive = router.pathname === item.href;

  const baseClasses = [
    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
    'transition-colors duration-150',
  ];

  const activeClasses = isActive
    ? [
        'bg-primary-100 text-primary-900',
        'border-r-2 border-primary-500',
      ]
    : [
        'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
      ];

  const iconClasses = clsx(
    'mr-3 flex-shrink-0 h-5 w-5',
    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
  );

  return (
    <Link
      href={item.href}
      className={clsx(baseClasses, activeClasses)}
    >
      <item.icon className={iconClasses} aria-hidden="true" />
      <span className="flex-1">{item.name}</span>
      {item.badge && (
        <span className="ml-3 inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MW</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">
              Maven Wrapper
            </h1>
            <p className="text-xs text-gray-500">
              Bootstrap Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <NavigationItem key={item.name} item={item} mobile={mobile} />
          ))}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Maven Wrapper v1.0.0</p>
            <p className="mt-1">Zero-Setup Builds</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ open = false, onClose, mobile = false }: SidebarProps) {
  if (mobile) {
    return (
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose || (() => {})}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent mobile />
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <SidebarContent />
    </div>
  );
}

export type { SidebarProps, NavigationItem };
