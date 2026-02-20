import { Button, ButtonProps } from "@/components/ui/button";

export default function IconButton(props: ButtonProps) {
  return <Button size="icon" variant="ghost" {...props} />;
}
