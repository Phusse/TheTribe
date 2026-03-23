import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import tribeLogo from "@/assets/tribe-logo.png";
import { useState } from "react";

interface MobileHeaderProps {
    children: React.ReactNode;
    title?: string;
}

const MobileHeader = ({ children, title = "The Tribe" }: MobileHeaderProps) => {
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4 md:hidden">
            <div className="flex items-center gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button className="w-10 h-10 flex items-center justify-center text-sidebar-foreground hover:bg-surface-hover rounded-lg transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r-sidebar-border">
                        <SheetHeader className="sr-only">
                            <SheetTitle>{title}</SheetTitle>
                        </SheetHeader>
                        <div onClick={() => setOpen(false)} className="h-full">
                            {children}
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                    <img src={tribeLogo} alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-display text-foreground text-sm font-medium">{title}</span>
                </div>
            </div>

            {/* Placeholder for right-side actions if needed */}
            <div className="w-10" />
        </header>
    );
};

export default MobileHeader;
