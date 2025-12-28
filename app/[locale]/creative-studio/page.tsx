'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Images, Loader2 } from 'lucide-react';
import { CreativeStudioForm } from '@/components/creative-studio/creative-studio-form';
import { GenerationGallery } from '@/components/creative-studio/generation-gallery';
import { usePendingGenerationsCount } from '@/lib/creative-studio/hooks';

export default function CreativeStudioPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create');
  const pendingCount = usePendingGenerationsCount();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Creative Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate styled pilates studio images with AI
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {pendingCount} generation{pendingCount > 1 ? 's' : ''} in progress
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'gallery')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            Gallery
            {pendingCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <CreativeStudioForm onGenerationStarted={() => setActiveTab('gallery')} />
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <GenerationGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
}
