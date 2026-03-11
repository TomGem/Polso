"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChannelFilterProps {
  channels: string[];
  value: string;
  onChange: (value: string | null) => void;
}

export function ChannelFilter({ channels, value, onChange }: ChannelFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All channels" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All channels</SelectItem>
        {channels.map((ch) => (
          <SelectItem key={ch} value={ch}>
            {ch}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
