import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
// Import Emoji type from emoji-mart
import { Emoji as EmojiType } from "@emoji-mart/data"; 

interface EmojiPopoverProps {
  children: React.ReactNode;
  hint?: string;
  onEmojiSelected: (emoji: EmojiType) => void; // Use the imported EmojiType here
}

export const EmojiPopover = ({
  children,
  hint = "Emoji",
  onEmojiSelected,
}: EmojiPopoverProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const onSelect = (emoji: EmojiType) => { // Use the imported EmojiType here
    onEmojiSelected(emoji);
    setPopoverOpen(false);
    setTimeout(() => {
      setTooltipOpen(false);
    }, 500);
  };

  return (
    <div>
      <TooltipProvider>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Tooltip
            open={tooltipOpen}
            onOpenChange={setTooltipOpen}
            delayDuration={50}
          >
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                {children}
              </TooltipTrigger>
            </PopoverTrigger>
            <TooltipContent className="bg-black text-white border-white/5">
              <p className="font-medium text-xs">{hint}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="p-0 w-full border-none shadow-none">
            <Picker data={data} onEmojiSelect={onSelect} />
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  );
};
