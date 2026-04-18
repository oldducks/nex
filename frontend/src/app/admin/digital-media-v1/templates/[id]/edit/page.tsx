"use client";

import { useParams } from 'next/navigation';
import { TemplateForm } from '../../template-form';

export default function EditTemplatePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id || 0);

  if (!id) {
    return null;
  }

  return <TemplateForm mode="edit" templateId={id} />;
}
