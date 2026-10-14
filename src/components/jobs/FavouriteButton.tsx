import { Heart } from 'lucide-react'
import type { ComponentProps } from 'react'
import type { JobPreview } from '@/entities/job'
import { cn } from '@/lib/utils'
import { useFavouritesStore } from '@/store/client/favourites/favourites.store'
import { useIsFavourite } from '@/store/client/favourites/favourites.hooks'

interface FavouriteButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  job: JobPreview
  variant?: 'icon' | 'labelled'
}

export function FavouriteButton({
  job,
  variant = 'icon',
  className,
  onClick,
  ...props
}: FavouriteButtonProps) {
  const isFavourite = useIsFavourite(job.workAssignmentId)
  const toggle = useFavouritesStore((state) => state.toggle)
  const label = isFavourite ? 'Remove from favourites' : 'Add to favourites'

  return (
    <button
      type="button"
      aria-label={variant === 'icon' ? label : undefined}
      className={cn(
        'flex shrink-0 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700',
        variant === 'icon'
          ? '-mt-2 -mr-2 size-11 rounded-full hover:bg-slate-100'
          : 'min-h-11 gap-2.5 rounded-full border border-slate-300 bg-white px-5 font-semibold hover:bg-slate-50',
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        toggle(job)
      }}
    >
      <Heart
        aria-hidden
        className={cn('size-6', isFavourite ? 'fill-rose-600 text-rose-600' : 'text-slate-600')}
      />
      {variant === 'labelled' && label}
    </button>
  )
}
