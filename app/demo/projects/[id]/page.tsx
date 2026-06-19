import { DemoProjectDetail } from "@/components/demo/DemoProjectDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DemoProjectDetail projectId={id} />;
}
