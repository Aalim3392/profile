import { Skeleton } from './skeleton.jsx';

export function RouteLoader() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="hidden gap-3 md:flex">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-32" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>

      <Skeleton className="h-96 w-full" />
    </div>
  );
}
