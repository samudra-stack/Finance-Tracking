"use client";
import { Modal } from "@/components/ui/Modal";
import { Sidebar } from "./Sidebar";
export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Menu MyFinance"
      className="mobile-drawer"
    >
      <Sidebar onNavigate={onClose} />
    </Modal>
  );
}
