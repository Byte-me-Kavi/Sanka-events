import { ArrowDownLeft, ArrowUpRight, Equals, TrendDown, TrendUp } from "@phosphor-icons/react/ssr";
import { money, type Summary } from "@/lib/budget";

export function StatTiles({ s }: { s: Summary }) {
  const result = s.profit < 0 ? "loss" : s.profit > 0 ? "profit" : "even";
  return (
    <div className="adm-stats">
      <div className="adm-stat adm-stat--in">
        <span className="adm-stat-label">
          <span className="adm-stat-icon">
            <ArrowDownLeft size={16} weight="bold" aria-hidden />
          </span>
          Money in
        </span>
        <span className="adm-stat-value">{money(s.income)}</span>
        <span className="adm-stat-note">{s.toCollect > 0 ? `${money(s.toCollect)} still to collect` : "All collected"}</span>
      </div>
      <div className="adm-stat adm-stat--out">
        <span className="adm-stat-label">
          <span className="adm-stat-icon">
            <ArrowUpRight size={16} weight="bold" aria-hidden />
          </span>
          Money out
        </span>
        <span className="adm-stat-value">{money(s.spending)}</span>
        <span className="adm-stat-note">{s.toPay > 0 ? `${money(s.toPay)} still to pay` : "All paid"}</span>
      </div>
      <div className={`adm-stat adm-stat--${result}`}>
        <span className="adm-stat-label">
          <span className="adm-stat-icon">
            {result === "loss" ? (
              <TrendDown size={16} weight="bold" aria-hidden />
            ) : result === "profit" ? (
              <TrendUp size={16} weight="bold" aria-hidden />
            ) : (
              <Equals size={16} weight="bold" aria-hidden />
            )}
          </span>
          {result === "loss" ? "Loss" : result === "profit" ? "Profit" : "Break even"}
        </span>
        <span className="adm-stat-value">{money(Math.abs(s.profit))}</span>
        <span className="adm-stat-note">Money in minus money out</span>
      </div>
    </div>
  );
}
