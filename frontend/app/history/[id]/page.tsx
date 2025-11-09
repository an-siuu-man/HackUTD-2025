import { WebsiteDetailContent } from "@/components/website-detail-content"

export default async function WebsiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <WebsiteDetailContent websiteId={id} />
}
