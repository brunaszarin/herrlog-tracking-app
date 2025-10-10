import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-30 p-0"
      onClick={onClick}
      data-testid="floating-action-button"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}
