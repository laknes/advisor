import { AdminSettingsPage } from '../page';

export default async function AdminSettingsGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  return <AdminSettingsPage groupFilter={group} />;
}
