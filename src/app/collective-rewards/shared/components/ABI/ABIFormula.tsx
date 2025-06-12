/** @deprecated Use src/app/backing/components/ABIFormula.tsx instead */
export const ABIFormula = () => (
  <span className="flex items-center space-x-1">
    <span className="text-4xl">(</span>
    <span className="text-base">1 +</span>
    <span className="relative flex flex-col items-center justify-center space-y-1">
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="border-t border-white w-full" />
      </span>
      <span className="text-xs">
        <span>Rewards per stRIF per Cycle</span>
      </span>
      <span className="text-xs">
        <span>RIF price</span>
      </span>
    </span>
    <span className="text-4xl">)</span>
    <sup className="text-sm relative -top-4 left-[-4px]">26</sup> - <span className="text-base">1</span>
  </span>
)
