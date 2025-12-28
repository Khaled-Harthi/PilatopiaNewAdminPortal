'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  RefreshCw,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGenerations,
  useDeleteGeneration,
  useRetryGeneration,
  useGenerationStatus,
} from '@/lib/creative-studio/hooks';
import type { Generation, GenerationStatus } from '@/lib/creative-studio/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', icon: <Clock className="h-3 w-3" />, variant: 'secondary' },
  processing: { label: 'Processing', icon: <Loader2 className="h-3 w-3 animate-spin" />, variant: 'default' },
  completed: { label: 'Completed', icon: <CheckCircle className="h-3 w-3" />, variant: 'outline' },
  failed: { label: 'Failed', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
  cancelled: { label: 'Cancelled', icon: <XCircle className="h-3 w-3" />, variant: 'secondary' },
};

function GenerationCard({ generation, onRefetch }: { generation: Generation; onRefetch: () => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const deleteGeneration = useDeleteGeneration();
  const retryGeneration = useRetryGeneration();

  // Poll status for pending/processing generations
  const { data: statusData } = useGenerationStatus(
    generation.status === 'pending' || generation.status === 'processing' ? generation.id : null
  );

  // Use polled status if available
  const currentStatus = statusData?.status || generation.status;
  const resultUrl = statusData?.resultImageUrl || generation.resultImageUrl;

  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;

  const handleDownload = () => {
    if (resultUrl) {
      window.open(resultUrl, '_blank');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGeneration.mutateAsync(generation.id);
      toast.success('Generation deleted');
      onRefetch();
    } catch (error) {
      toast.error('Failed to delete generation');
    }
  };

  const handleRetry = async () => {
    try {
      await retryGeneration.mutateAsync(generation.id);
      toast.success('Retry started');
      onRefetch();
    } catch (error) {
      toast.error('Failed to retry generation');
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-square relative bg-muted">
          {resultUrl ? (
            <img
              src={generation.resultThumbnailUrl || resultUrl}
              alt="Generated"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowPreview(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {currentStatus === 'processing' || currentStatus === 'pending' ? (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentStatus === 'processing' ? 'Generating...' : 'Queued'}
                  </p>
                </div>
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Status Badge */}
          <Badge variant={statusConfig.variant} className="absolute top-2 left-2 gap-1">
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>

        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {new Date(generation.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-1">
              {resultUrl && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              )}
              {currentStatus === 'failed' && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRetry}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={handleDelete}
                disabled={deleteGeneration.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {generation.errorMessage && (
            <p className="text-xs text-destructive mt-2 line-clamp-2">{generation.errorMessage}</p>
          )}

          {generation.generationTimeMs && (
            <p className="text-xs text-muted-foreground mt-1">
              Generated in {(generation.generationTimeMs / 1000).toFixed(1)}s
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated Image</DialogTitle>
            <DialogDescription>
              Created on {new Date(generation.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {resultUrl && (
            <div className="relative">
              <img src={resultUrl} alt="Generated" className="w-full rounded-lg" />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleDownload}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full Size
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GenerationGallery() {
  const { data, isLoading, refetch } = useGenerations({ limit: 50 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <CardContent className="p-3">
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <Card className="p-12 text-center">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No generations yet</h3>
        <p className="text-muted-foreground">
          Start creating images in the Create tab to see them here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.total} generation{data.total !== 1 ? 's' : ''}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.data.map((generation) => (
          <GenerationCard key={generation.id} generation={generation} onRefetch={refetch} />
        ))}
      </div>
    </div>
  );
}
