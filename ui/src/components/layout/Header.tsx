import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useWebSocket } from '@/hooks/useWebSocket';

interface User {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface HeaderProps {
  onMenuClick: () => void;
  user?: User;
}

function NotificationBell() {
  const [notifications, setNotifications] = React.useState(0);
  const { subscribe } = useWebSocket();

  React.useEffect(() => {
    const unsubscribe = subscribe('notification', (data) => {
      setNotifications(prev => prev + 1);
    });

    return unsubscribe;
  }, [subscribe]);

  return (
    <button
      type="button"
      className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
      aria-label="View notifications"
    >
      <BellIcon className="h-6 w-6" aria-hidden="true" />
      {notifications > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
          {notifications > 9 ? '9+' : notifications}
        </span>
      )}
    </button>
  );
}

function SystemStatus() {
  const [status, setStatus] = React.useState<'UP' | 'DOWN' | 'DEGRADED'>('UP');
  const { subscribe } = useWebSocket();

  React.useEffect(() => {
    const unsubscribe = subscribe('health_update', (data) => {
      setStatus(data.status);
    });

    return unsubscribe;
  }, [subscribe]);

  const statusMap = {
    UP: 'success' as const,
    DOWN: 'error' as const,
    DEGRADED: 'warning' as const,
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">System:</span>
      <StatusBadge
        status={statusMap[status]}
        text={status}
        size="sm"
      />
    </div>
  );
}

function UserMenu({ user }: { user?: User }) {
  const { logout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <UserCircleIcon className="h-8 w-8 text-gray-400" />
        <span className="text-sm text-gray-500">Not signed in</span>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all">
          <span className="sr-only">Open user menu</span>
          {user.avatar ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.avatar}
              alt={user.name}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="ml-3 text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role || 'User'}</p>
          </div>
        </Menu.Button>
      </div>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          
          <Menu.Item>
            {({ active }) => (
              <a
                href="/profile"
                className={clsx(
                  active ? 'bg-gray-100' : '',
                  'flex items-center px-4 py-2 text-sm text-gray-700'
                )}
              >
                <UserCircleIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                Your Profile
              </a>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <a
                href="/settings"
                className={clsx(
                  active ? 'bg-gray-100' : '',
                  'flex items-center px-4 py-2 text-sm text-gray-700'
                )}
              >
                <Cog6ToothIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                Settings
              </a>
            )}
          </Menu.Item>
          
          <div className="border-t border-gray-200">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={clsx(
                    active ? 'bg-gray-100' : '',
                    'flex items-center w-full px-4 py-2 text-sm text-gray-700'
                  )}
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export function Header({ onMenuClick, user }: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-gray-200">
      {/* Mobile menu button */}
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Header content */}
      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Left side - System status */}
        <div className="flex items-center space-x-4">
          <SystemStatus />
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          <NotificationBell />
          <UserMenu user={user} />
        </div>
      </div>
    </div>
  );
}

export type { HeaderProps, User };
