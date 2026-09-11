import type { Order, OrderStatus } from "@echo/shared";
import { money, STATUS, when } from "@/lib/format";

type Props = {
  orders: Order[];
  filter: "all" | OrderStatus;
  onFilter: (value: "all" | OrderStatus) => void;
  onStatus: (id: string, status: OrderStatus) => void;
};

export function OrdersView({ orders, filter, onFilter, onStatus }: Props) {
  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="stack">
      <div className="chips">
        <button type="button" className={filter === "all" ? "chip is-on" : "chip"} onClick={() => onFilter("all")}>
          Tất cả
        </button>
        {(Object.keys(STATUS) as OrderStatus[]).map((key) => (
          <button
            key={key}
            type="button"
            className={filter === key ? "chip is-on" : "chip"}
            onClick={() => onFilter(key)}
          >
            {STATUS[key].label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>Chưa có đơn {filter === "all" ? "" : STATUS[filter].label.toLowerCase()}.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Đơn</th>
                <th>Khách</th>
                <th>Món</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.id}</strong>
                    <div className="muted tiny">{when(o.createdAt)}</div>
                  </td>
                  <td>
                    <strong>{o.name}</strong>
                    <div className="muted tiny">
                      {o.phone}
                      <br />
                      {o.address}
                    </div>
                    {o.note ? <div className="muted tiny">Ghi chú: {o.note}</div> : null}
                  </td>
                  <td>
                    <ul className="lines">
                      {o.items.map((it) => (
                        <li key={`${it.slug}-${it.size}-${it.color}`}>
                          {it.name} × {it.qty}
                          <span className="muted">
                            {" "}
                            · {it.size}/{it.color}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="muted tiny">{o.pay === "cod" ? "COD" : "Chuyển khoản"}</div>
                  </td>
                  <td>
                    <strong>{money(o.total)}</strong>
                    <div className="muted tiny">Ship {money(o.ship)}</div>
                  </td>
                  <td>
                    <span className={`badge badge--${STATUS[o.status].tone}`}>{STATUS[o.status].label}</span>
                    <select
                      className="status-select"
                      value={o.status}
                      onChange={(e) => onStatus(o.id, e.target.value as OrderStatus)}
                    >
                      {(Object.keys(STATUS) as OrderStatus[]).map((key) => (
                        <option key={key} value={key}>
                          {STATUS[key].label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
