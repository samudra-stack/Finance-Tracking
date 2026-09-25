import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
export const metadata = { title: "Pengaturan" };
export default function Settings() {
  return (
    <>
      <PageHeader
        title="Pengaturan"
        description="Personalisasi akun dan preferensi aplikasi"
      />
      <SettingsScreen />
    </>
  );
}
