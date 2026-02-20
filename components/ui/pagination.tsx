import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <Button variant="outline" disabled={page <= 1} onClick={onPrev}>
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" disabled={page >= totalPages} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}
