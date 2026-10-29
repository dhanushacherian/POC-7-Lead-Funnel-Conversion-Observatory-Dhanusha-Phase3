"use client";

type FilterBarProps = {
  startDate: string;
  endDate: string;
  location: string;
  team: string;
  product: string;

  locations: string[];
  teams: string[];
  products: string[];

  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onTeamChange: (value: string) => void;
  onProductChange: (value: string) => void;

  onReset: () => void;
};

export default function FilterBar({
  startDate,
  endDate,
  location,
  team,
  product,
  locations,
  teams,
  products,
  onStartDateChange,
  onEndDateChange,
  onLocationChange,
  onTeamChange,
  onProductChange,
  onReset,
}: FilterBarProps) {
  return (
    <section className="print-filter-section min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 shadow-xl backdrop-blur-xl sm:p-3 md:p-4">

      {/* Header */}
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-indigo-300/50">
            Observatory Controls
          </p>

          <h2 className="mt-2 text-base font-semibold text-white">
            Refine the lead conversion view
          </h2>
        </div>

        <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white/35">
            05 Filters
          </span>
        </div>

      </div>

      {/* Filters */}
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-5">

        {/* From Date */}
        <div>
          <label
            htmlFor="start-date"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-white/35"
          >
            From Date
          </label>

          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(event) =>
              onStartDateChange(event.target.value)
            }
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition focus:border-indigo-300/[0.35] focus:bg-white/[0.04]"
          />
        </div>

        {/* To Date */}
        <div>
          <label
            htmlFor="end-date"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-white/35"
          >
            To Date
          </label>

          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(event) =>
              onEndDateChange(event.target.value)
            }
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition focus:border-indigo-300/[0.35] focus:bg-white/[0.04]"
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location-filter"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-white/35"
          >
            Location
          </label>

          <select
            id="location-filter"
            value={location}
            onChange={(event) =>
              onLocationChange(event.target.value)
            }
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition focus:border-indigo-300/[0.35] focus:bg-white/[0.04]"
          >
            <option value="All">
              All Locations
            </option>

            {locations.map((item) => (
              <option
                key={item}
                value={item}
                className="bg-[#090b16] text-white"
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Team */}
        <div>
          <label
            htmlFor="team-filter"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-white/35"
          >
            Team
          </label>

          <select
            id="team-filter"
            value={team}
            onChange={(event) =>
              onTeamChange(event.target.value)
            }
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition focus:border-indigo-300/[0.35] focus:bg-white/[0.04]"
          >
            <option value="All">
              All Teams
            </option>

            {teams.map((item) => (
              <option
                key={item}
                value={item}
                className="bg-[#090b16] text-white"
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label
            htmlFor="product-filter"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-white/35"
          >
            Product
          </label>

          <select
            id="product-filter"
            value={product}
            onChange={(event) =>
              onProductChange(event.target.value)
            }
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition focus:border-indigo-300/[0.35] focus:bg-white/[0.04]"
          >
            <option value="All">
              All Products
            </option>

            {products.map((item) => (
              <option
                key={item}
                value={item}
                className="bg-[#090b16] text-white"
              >
                {item}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Reset */}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-white/35 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white/70"
        >
          Reset Filters
        </button>
      </div>

    </section>
  );
}
