import { LayoutEditor } from '@/components/home-layouts/layout-editor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHomeLayoutPage({ params }: PageProps) {
  const { id } = await params;
  const layoutId = parseInt(id, 10);

  if (isNaN(layoutId)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Invalid layout ID</p>
      </div>
    );
  }

  return <LayoutEditor layoutId={layoutId} />;
}
