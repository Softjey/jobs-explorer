import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { useFavouritesCount } from '@/store/client/favourites/favourites.hooks'

type AppHeaderProps = ComponentProps<'header'>

const navLinkClass =
  'flex min-h-11 items-center gap-2 rounded-lg px-4 font-semibold text-slate-700 hover:bg-slate-100'
const activeNavLinkClass = cn(navLinkClass, 'bg-indigo-50 text-indigo-800 hover:bg-indigo-50')

export function AppHeader({ className, ...props }: AppHeaderProps) {
  const favouritesCount = useFavouritesCount()

  return (
    <header
      className={cn('sticky top-0 z-40 border-b border-slate-200 bg-white', className)}
      {...props}
    >
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Coople Jobs
        </Link>
        <nav className="flex gap-2">
          <Link
            to="/"
            className={navLinkClass}
            activeProps={{ className: activeNavLinkClass }}
            activeOptions={{ exact: true }}
          >
            Jobs
          </Link>
          <Link
            to="/favourites"
            className={navLinkClass}
            activeProps={{ className: activeNavLinkClass }}
          >
            Favourites
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[13px]">
              {favouritesCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
