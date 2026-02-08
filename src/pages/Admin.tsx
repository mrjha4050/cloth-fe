import AdminLayout from '@/components/admin/AdminLayout';
import { Outlet } from 'react-router-dom';

export default function Admin() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
