'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';

export function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const email = user.email;

  return (
    <div className="flex items-center gap-3 p-4 border-t">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <UserIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        title="Sign out"
        className="shrink-0"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
