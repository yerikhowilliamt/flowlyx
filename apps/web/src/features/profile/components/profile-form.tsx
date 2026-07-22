'use client';

import { useState } from 'react';
import { useMe, useUpdateProfile } from '../hooks/use-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileForm() {
  const { data: user, isLoading } = useMe();
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [prevUser, setPrevUser] = useState(user);
  if (user && user !== prevUser) {
    setPrevUser(user);
    setName(user.name);
    setAvatarPreview(user.avatarUrl ?? null);
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-zinc-400">User profile not found.</div>;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      await updateProfileMutation.mutateAsync({ id: user.id, data: formData });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-sm max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-zinc-50">Profile Settings</CardTitle>
        <CardDescription className="text-zinc-400">
          Manage your personal identity and settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative group">
              <Avatar className="h-24 w-24 border border-zinc-800">
                <AvatarImage src={avatarPreview || undefined} alt={user.name} />
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xl font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="h-6 w-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-semibold text-zinc-100">{user.name}</h3>
              <p className="text-sm text-zinc-400">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-zinc-800 bg-zinc-950 text-zinc-50 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Role</Label>
              <Input
                type="text"
                value={user.role}
                disabled
                className="border-zinc-800 bg-zinc-950/50 text-zinc-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Status</Label>
              <Input
                type="text"
                value={user.status}
                disabled
                className="border-zinc-800 bg-zinc-950/50 text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500"
          >
            {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
