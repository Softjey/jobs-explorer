import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useFavouriteList } from '@/store/client/favourites.store'

const linkClass =
  'flex min-h-11 items-center gap-2 rounded-lg px-4 font-semibold text-slate-700 hover:bg-slate-100'
const activeClass = 'bg-indigo-50 text-indigo-800 hover:bg-indigo-50'

export function AppHeader() {
  const count = useFavouriteList().length

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Coople Jobs
        </Link>
        <nav className="flex gap-2">
          <Link
            to="/"
            className={linkClass}
            activeProps={{ className: cn(linkClass, activeClass) }}
            activeOptions={{ exact: true }}
          >
            Jobs
          </Link>
          <Link
            to="/favourites"
            className={linkClass}
            activeProps={{ className: cn(linkClass, activeClass) }}
          >
            Favourites
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[13px]">
              {count}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
