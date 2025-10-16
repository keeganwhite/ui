import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ButtonLoadingProps {
  disabled?: boolean;
  className?: string;
}

const ButtonLoading = ({
  disabled = true,
  className = "",
}: ButtonLoadingProps) => (
  <Button size="sm" disabled={disabled} className={className}>
    <Loader2Icon className="animate-spin mr-2" />
    Please wait
  </Button>
);

export default ButtonLoading;
