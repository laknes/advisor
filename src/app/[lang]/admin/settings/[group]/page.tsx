import { AdminSettingsPage } from '../_components/AdminSettingsPage';

export default async function AdminSettingsGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  return <AdminSettingsPage groupFilter={group} />;
}
