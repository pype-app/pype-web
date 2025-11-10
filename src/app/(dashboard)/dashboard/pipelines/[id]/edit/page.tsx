import { use } from 'react';
import PipelineEditor from '@/components/editor/PipelineEditor';

interface EditPipelinePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPipelinePage({ params }: EditPipelinePageProps) {
  const { id } = use(params);
  return <PipelineEditor pipelineId={id} />;
}