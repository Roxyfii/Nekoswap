// src/components/BottomNavbar.tsx
import { Button, ButtonGroup } from "@heroui/button";
import { Home, User, Settings } from "lucide-react";

export default function BottomNavbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 shadow-md z-50 flex justify-around p-2">
      <Button
        variant="ghost"
        className="flex flex-col items-center gap-1 text-xs"
      >
        <Home size={20} />
        Home
      </Button>
      <Button
        variant="ghost"
        className="flex flex-col items-center gap-1 text-xs"
      >
        <User size={20} />
        Earn
      </Button>
      <Button
        variant="ghost"
        className="flex flex-col items-center gap-1 text-xs"
      >
        <Settings size={20} />
        LP
      </Button>
      <Button
        variant="ghost"
        className="flex flex-col items-center gap-1 text-xs"
      >
        <Settings size={20} />
        Swap
      </Button>
    </nav>
  );
}
