import React, { useState, useMemo, useEffect } from "react";
import { Plus, ChevronDown, Search, X } from "lucide-react";
import {
  PositionRecord,
  PositionGroup,
  fetchPositions,
  groupPositions,
  addCustomPosition,
} from "../services/supabase";

interface PositionSelectorProps {
  value: string;
  onChange: (positionName: string) => void;
  categoryHint?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  value,
  onChange,
  categoryHint,
  label = "Position / Role",
  required = false,
  className = "",
}) => {
  const [groups, setGroups] = useState<PositionGroup[]>([]);
  const [allRows, setAllRows] = useState<PositionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [customCategory, setCustomCategory] = useState(categoryHint || "");
  const [customSubcategory, setCustomSubcategory] = useState("");
  const [customName, setCustomName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await fetchPositions();
      if (!active) return;
      setAllRows(rows);
      setGroups(groupPositions(rows));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (categoryHint) setCustomCategory(categoryHint);
  }, [categoryHint]);

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        subcategories: g.subcategories
          .map((s) => ({
            ...s,
            positions: s.positions.filter((p) => p.name.toLowerCase().includes(q)),
          }))
          .filter((s) => s.positions.length > 0),
      }))
      .filter((g) => g.subcategories.length > 0);
  }, [groups, query]);

  const exactMatch = useMemo(() => {
    if (!value.trim()) return true;
    return allRows.some((p) => p.name.toLowerCase() === value.trim().toLowerCase());
  }, [value, allRows]);

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
    setQuery("");
  };

  const handleAddCustom = async () => {
    setAddError(null);
    if (!customName.trim()) {
      setAddError("Please enter a position name.");
      return;
    }
    if (!customCategory.trim()) {
      setAddError("Please choose a category.");
      return;
    }
    setAddLoading(true);
    const created = await addCustomPosition(customCategory, customSubcategory, customName);
    setAddLoading(false);
    if (created) {
      const updated = [...allRows, created].sort((a, b) =>
        a.category.localeCompare(b.category) ||
        a.subcategory.localeCompare(b.subcategory) ||
        a.name.localeCompare(b.name)
      );
      setAllRows(updated);
      setGroups(groupPositions(updated));
      handleSelect(created.name);
      setAdding(false);
      setCustomName("");
      setCustomSubcategory("");
    } else {
      setAddError("Could not save the position. Please try again.");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
        {label} {required && <span className="text-[#8B4513]">*</span>}
      </label>

      <div className="flex items-stretch gap-1.5">
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setAdding(false);
          }}
          className="flex-1 flex items-center justify-between px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs sm:text-sm font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513] text-left"
        >
          <span className={value ? "" : "text-[#A8A29E]"}>
            {value || "Select a position..."}
          </span>
          <ChevronDown className={`w-4 h-4 text-[#78716C] transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-2.5 rounded-md border border-[#E7E2DA] bg-[#FFFFFF] hover:bg-[#F2ECE4] text-[#78716C] flex items-center"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!exactMatch && value && (
        <p className="mt-1 text-[10px] font-mono text-[#8B4513]">
          Custom position (not in the official list)
        </p>
      )}

      {open && (
        <div className="absolute z-40 mt-1 w-full bg-[#FFFFFF] border border-[#E7E2DA] rounded-lg shadow-xl max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#E7E2DA] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search positions..."
              className="flex-1 text-xs font-mono bg-transparent outline-none text-[#1C1917] placeholder:text-[#A8A29E]"
              autoFocus
            />
          </div>

          {adding ? (
            <div className="p-3 space-y-2 overflow-y-auto">
              <div className="text-[10px] font-mono uppercase font-bold text-[#57534E]">
                Add your own position
              </div>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Category *"
                className="w-full px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
              />
              <input
                type="text"
                value={customSubcategory}
                onChange={(e) => setCustomSubcategory(e.target.value)}
                placeholder="Subcategory (optional)"
                className="w-full px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
              />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Position name *"
                className="w-full px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                autoFocus
              />
              {addError && (
                <p className="text-[10px] font-mono text-rose-700">{addError}</p>
              )}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={addLoading}
                  className="px-3 py-1.5 rounded-md bg-[#8B4513] hover:bg-[#73380F] text-white text-[10px] font-mono font-bold uppercase tracking-wider disabled:opacity-60"
                >
                  {addLoading ? "Saving..." : "Save & Select"}
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="px-3 py-1.5 rounded-md border border-[#E7E2DA] bg-[#FFFFFF] hover:bg-[#F2ECE4] text-[#57534E] text-[10px] font-mono font-bold uppercase tracking-wider"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-3 text-[11px] font-mono text-[#78716C]">Loading positions...</div>
              ) : filteredGroups.length === 0 ? (
                <div className="p-3 text-[11px] font-mono text-[#78716C]">No positions found.</div>
              ) : (
                filteredGroups.map((g) => (
                  <div key={g.category}>
                    <div className="px-3 py-1.5 bg-[#FAF9F6] text-[10px] font-mono font-bold uppercase tracking-wider text-[#57534E] sticky top-0">
                      {g.category}
                    </div>
                    {g.subcategories.map((s) => (
                      <div key={`${g.category}-${s.subcategory}`}>
                        <div className="px-3 pt-1.5 text-[10px] font-mono text-[#8B4513]">
                          {s.subcategory}
                        </div>
                        {s.positions.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelect(p.name)}
                            className={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-[#F2ECE4] flex items-center justify-between ${
                              value === p.name ? "bg-[#F2ECE4] text-[#8B4513] font-bold" : "text-[#1C1917]"
                            }`}
                          >
                            <span>{p.name}</span>
                            {p.is_custom && (
                              <span className="text-[8px] px-1 py-0.5 bg-[#E7E2DA] text-[#57534E] rounded-xs uppercase">
                                Custom
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={() => {
                  setAdding(true);
                  setAddError(null);
                  setCustomName(query || "");
                }}
                className="w-full text-left px-3 py-2 mt-1 border-t border-[#E7E2DA] text-xs font-mono font-bold text-[#8B4513] hover:bg-[#F2ECE4] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add my own position</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
