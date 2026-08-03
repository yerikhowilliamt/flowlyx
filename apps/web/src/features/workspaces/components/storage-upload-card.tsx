'use client';

import { useState } from 'react';
import { useUploadFile } from '../hooks/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UploadCloud, FileIcon } from 'lucide-react';

interface StorageUploadCardProps {
  workspaceId: string;
  projectId?: string;
}

export function StorageUploadCard({ workspaceId, projectId }: StorageUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadMutation = useUploadFile(workspaceId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        projectId,
      });
      setSelectedFile(null);
    } catch {
      // Error is handled inside hook toast
    }
  };

  return (
    <Card className="bg-zinc-900/60 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-orange-400" />
          Workspace Asset Storage
        </CardTitle>
        <CardDescription className="text-zinc-400 text-xs">
          Upload assets, documents, and reference files to the workspace&apos;s Cloudinary storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 bg-zinc-950/40 rounded-xl p-6 hover:border-orange-500/30 transition-colors relative">
          <Input
            type="file"
            id="workspace-asset-file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center text-center space-y-2 pointer-events-none">
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-white flex items-center gap-1 justify-center">
                  <FileIcon className="w-3.5 h-3.5 text-orange-400" />
                  {selectedFile.name}
                </p>
                <p className="text-3xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-zinc-300">Click or drag file to upload</p>
                <p className="text-3xs text-zinc-500 mt-0.5">Supports images, PDFs, docs up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {selectedFile && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFile(null)}
              className="border-zinc-800 text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Uploading...
                </>
              ) : (
                'Upload File'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
