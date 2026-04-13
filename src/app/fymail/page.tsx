import { FymailWorkspace } from '@/components/Fymail/FymailWorkspace';
import { listFymailData } from '@/lib/fymail';

export default async function FymailPage() {
  try {
    const store = await listFymailData();
    const contacts = store?.contacts || [];
    const templates = store?.templates || [];
    const jobs = store?.jobs || [];

    return <FymailWorkspace initialContacts={contacts} initialTemplates={templates} initialJobs={jobs} />;
  } catch (error) {
    console.error('Failed to load FYMail data:', error);
    // 返回空数据的组件
    return <FymailWorkspace initialContacts={[]} initialTemplates={[]} initialJobs={[]} />;
  }
}
// Build timestamp: Thu Mar 26 12:31:44 AM EDT 2026
