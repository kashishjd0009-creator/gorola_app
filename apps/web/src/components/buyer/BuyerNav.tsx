import { Clock, MapPin, Search, ShoppingCart, UserRound } from "lucide-react";
import type { KeyboardEvent, ReactElement } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { GorolaMountainMark } from "@/components/shared/GorolaMountainMark";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useWeatherStore } from "@/store/weather.store";

export function BuyerNav(): ReactElement {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const count = useCartStore((s) => s.totalItemCount());
  const openCart = useCartStore((s) => s.open);
  const isWeatherMode = useWeatherStore((s) => s.isWeatherMode);
  const role = useAuthStore((s) => s.role);
  const name = useAuthStore((s) => s.name);
  const phone = useAuthStore((s) => s.phone);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);

  const buyerLabel =
    name !== null && name.trim().length > 0 ? name.trim() : (phone !== null ? phone : "Buyer");

  async function logoutBuyer(): Promise<void> {
    try {
      if (api !== null && refreshToken !== null && refreshToken.length > 0) {
        await api.post("/api/v1/auth/buyer/logout", { refreshToken });
      }
    } finally {
      clearSession();
      navigate("/", { replace: true });
    }
  }

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== "Enter") {
      return;
    }
    const query = search.trim();
    navigate(query.length > 0 ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b border-white/10 px-4 py-3 backdrop-blur",
        isWeatherMode ? "bg-gorola-slate/95" : "bg-gorola-pine/95"
      )}
      data-weather={isWeatherMode ? "on" : "off"}
      aria-label="Buyer navigation"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
        <Link to="/" className="flex items-center gap-2 text-gorola-fog">
          <span aria-label="GoRola mountain logo">
            <GorolaMountainMark />
          </span>
          <span className="font-playfair text-xl tracking-wide">GoRola</span>
        </Link>

        <div className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-gorola-fog">
          <MapPin size={14} className="text-gorola-saffron" />
          <span>Kulri, Mussoorie</span>
        </div>

        <div className="order-4 relative mt-2 flex w-full basis-full items-center md:order-none md:mt-0 md:max-w-sm md:basis-auto">
          <Search size={15} className="pointer-events-none absolute left-3 text-white/60" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            onKeyDown={handleEnter}
            placeholder="Search products"
            className="w-full rounded-xl border border-white/20 bg-white/10 py-2 pl-9 pr-3 text-sm text-gorola-fog outline-none placeholder:text-white/60"
          />
        </div>

        <button
          type="button"
          aria-label="Open cart"
          onClick={openCart}
          className="relative inline-flex items-center gap-2 rounded-full bg-gorola-saffron px-3 py-2 text-sm font-semibold text-white"
        >
          <ShoppingCart size={15} />
          <span className="inline">Cart</span>
          <span
            className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gorola-amber px-1 text-[11px] font-bold text-gorola-charcoal"
            aria-label="Cart items"
          >
            {count}
          </span>
        </button>

        {role === "BUYER" ? (
          <div className="inline-flex items-center gap-2">
            <Link
              to="/profile"
              className="hidden rounded-full border border-white/20 px-3 py-2 text-sm text-gorola-fog md:inline hover:bg-white/10 transition-colors"
            >
              {buyerLabel}
            </Link>
            <Link
              to="/account/orders"
              className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-2 text-sm text-gorola-fog hover:bg-white/10"
            >
              <Clock size={15} />
              <span className="inline">Orders</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                void logoutBuyer();
              }}
              className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-2 text-sm text-gorola-fog"
            >
              <UserRound size={15} />
              <span className="inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-2 text-sm text-gorola-fog"
          >
            <UserRound size={15} />
            <span className="inline">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
