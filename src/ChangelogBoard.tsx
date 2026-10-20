import { changelog } from "./changelog";

function formatDay(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

export function ChangelogBoard() {
  return (
    <section className="fb-board cl-board" aria-label="개발 이력">
      <div className="fb-h">
        <b>개발 이력</b>
        <span>프로토타입을 날짜별로 어떻게 바꿨는지 기록입니다.</span>
      </div>
      <div className="fb-list">
        {changelog.map((day) => (
          <div className="cl-day" key={day.date}>
            <time className="cl-date" dateTime={day.date}>
              {formatDay(day.date)}
            </time>
            {day.items.map((it) => (
              <div className="cl-item" key={it.title}>
                <b>{it.title}</b>
                <p>{it.detail}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
