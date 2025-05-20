"use client";
import PoolList from "@/components/staking";
import pools from "@/Data/pools.json"
export default function EarnPage() {
  return (
    <div>
       <PoolList pools={pools} />
    </div>
  );
}
