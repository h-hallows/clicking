"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ScopeMap } from "./ScopeMap";
import { ScopeFilters } from "./ScopeFilters";
import { Topbar } from "@/components/nav/Topbar";
import { useScopeStore } from "@/store/scope-store";

function ScopeWrapperInner() {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";
  const highlight = searchParams.get("highlight");
  const { selectNode, setSearch } = useScopeStore();

  // Auto-select node from ?highlight= param (from MarketMovers / AlertsFeed links)
  useEffect(() => {
    if (highlight) {
      selectNode(highlight);
      setSearch(highlight);
    }
  }, [highlight, selectNode, setSearch]);

  if (isEmbed) {
    return (
      <div className="w-screen h-screen overflow-hidden" style={{ background: "#04040e" }}>
        <ScopeMap />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
      <Topbar
        title="The Scope"
        subtitle="Interactive map of the crypto ecosystem"
      />
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <ScopeFilters />
        <ScopeMap />
      </div>
    </div>
  );
}

export function ScopeWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center" style={{ background: "#0d0e12", color: "#484f58", fontSize: 12 }}>
          Loading Scope...
        </div>
      }
    >
      <ScopeWrapperInner />
    </Suspense>
  );
}
