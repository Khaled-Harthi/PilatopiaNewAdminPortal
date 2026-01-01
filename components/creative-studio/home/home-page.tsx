'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, Image as ImageIcon } from 'lucide-react';
import { CanvasGrid } from './canvas-grid';
import { LibraryModal } from '../library/library-modal';

interface HomePageProps {
  onOpenCanvas: (canvasId: number) => void;
  onCreateCanvas: () => void;
}

export function HomePage({ onOpenCanvas, onCreateCanvas }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'library'>('files');
  const [showLibrary, setShowLibrary] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <span className="text-xl">🎨</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-stone-800">Creative Studio</h1>
            <p className="text-sm text-stone-500">AI-powered image generation for pilates studios</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'files' | 'library')} className="flex-1 flex flex-col">
        <div className="px-6 border-b">
          <TabsList className="h-12 bg-transparent p-0 gap-6">
            <TabsTrigger
              value="files"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-stone-600 data-[state=active]:text-stone-900"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-stone-600 data-[state=active]:text-stone-900"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="files" className="flex-1 m-0 p-6">
          <CanvasGrid
            onOpenCanvas={onOpenCanvas}
            onCreateCanvas={onCreateCanvas}
          />
        </TabsContent>

        <TabsContent value="library" className="flex-1 m-0 p-6">
          <LibraryModal
            open={true}
            onOpenChange={() => {}}
            embedded={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
