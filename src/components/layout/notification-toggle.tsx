"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";

export function NotificationToggle() {
  const { permission, requestPermission } = useNotifications();

  async function handleClick() {
    if (permission === "granted") {
      toast.info("Notifications are enabled. Disable them in your browser settings.");
      return;
    }
    if (permission === "denied") {
      toast.error("Notifications are blocked. Enable them in your browser settings.");
      return;
    }
    const result = await requestPermission();
    if (result === "granted") {
      toast.success("Notifications enabled for important events");
    } else {
      toast.error("Notification permission denied");
    }
  }

  const Icon =
    permission === "granted"
      ? BellRing
      : permission === "denied"
        ? BellOff
        : Bell;

  const label =
    permission === "granted"
      ? "Notifications enabled"
      : permission === "denied"
        ? "Notifications blocked"
        : "Enable notifications";

  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={handleClick} />}>
        <Icon className="h-4 w-4" />
        <span className="sr-only">{label}</span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
