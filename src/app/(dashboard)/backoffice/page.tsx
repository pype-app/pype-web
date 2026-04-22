import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

export default function BackofficePage() {
  redirect(ROUTES.BACKOFFICE_DASHBOARD);
}
