import styles from "@/app/page.module.css";

const WEEKDAYS = [
  { short: "Mon", name: "Monday", className: styles.dayMon },
  { short: "Tue", name: "Tuesday", className: styles.dayTue },
  { short: "Wed", name: "Wednesday", className: styles.dayWed },
  { short: "Thu", name: "Thursday", className: styles.dayThu },
  { short: "Fri", name: "Friday", className: styles.dayFri },
  { short: "Sat", name: "Saturday", className: styles.daySat },
  { short: "Sun", name: "Sunday", className: styles.daySun },
];

export function DayProgressDisplay({ now }: { now: Date | null }) {
  // JavaScript starts the week on Sunday; this display starts on Monday.
  const dayIndex = now ? (now.getDay() + 6) % 7 : null;
  const position = dayIndex === null ? undefined : dayIndex + 1;
  const width = position === undefined ? 0 : Math.round((position / 7) * 100);

  return (
    <div className={styles.dayProgress}>
      <div className={styles.dayRow}>
        {WEEKDAYS.map((day, index) => (
          <span key={day.short} className={day.className} aria-current={index === dayIndex ? "date" : undefined}>
            {day.short}
          </span>
        ))}
      </div>
      <div
        className={styles.progressBarBg}
        role="progressbar"
        aria-label="Local weekday"
        aria-valuemin={0}
        aria-valuemax={7}
        aria-valuenow={position}
        aria-valuetext={dayIndex === null ? "Waiting for local date" : `${WEEKDAYS[dayIndex].name}, day ${position} of 7`}
      >
        <div className={styles.progressBar} style={{ width: `${width}%` }} />
        <div className={styles.fridayGlow} aria-hidden="true">✨</div>
      </div>
    </div>
  );
}
