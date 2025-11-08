import { WebsiteDetailContent } from "@/components/website-detail-content"

export default function WebsiteDetailPage({ params }: { params: { id: string } }) {
  return <WebsiteDetailContent websiteId={params.id} />
}
