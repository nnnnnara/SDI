import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  loading?: boolean;
  page: number;
  pageSize?: number;
  setPage: (updater: (value: number) => number) => void;
  totalPages: number;
  align?: 'between' | 'center';
}

export function currentPageNumber(page: number, totalPages: number) {
  return totalPages === 0 ? 0 : page + 1;
}

export function Pagination({ align = 'between', loading = false, page, pageSize, setPage, totalPages }: PaginationProps) {
  const currentPage = currentPageNumber(page, totalPages);
  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;

  return (
    <div className={`flex items-center gap-3 border-t border-brand-border px-5 py-4 text-sm ${align === 'center' ? 'justify-center' : 'justify-between'}`}>
      {pageSize && <span className="text-brand-textSub">페이지당 {pageSize}건</span>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((value) => Math.max(0, value - 1))}
          disabled={isFirstPage || loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border text-brand-textSub hover:text-brand-textMain disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="이전 페이지"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="min-w-24 text-center text-brand-textMain">
          {currentPage} / {totalPages || 0}
        </span>
        <button
          type="button"
          onClick={() => setPage((value) => Math.min(Math.max(totalPages - 1, 0), value + 1))}
          disabled={isLastPage || loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border text-brand-textSub hover:text-brand-textMain disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="다음 페이지"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
