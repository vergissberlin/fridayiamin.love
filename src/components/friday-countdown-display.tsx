import { getNextFridayCountdown } from "@/lib/friday-countdown";
import styles from "@/app/page.module.css";

export function FridayCountdownDisplay({ now }: { now: Date | null }) {
  if (!now) return null;

  const countdown = getNextFridayCountdown(now);
  const isFriday = now.getDay() === 5;

  return (
    <div className={styles.fridayCountdown}>
      {isFriday ? (
        <div className={styles.fridayParty} role="status" aria-label="Today is Friday celebration">
          <p className={styles.fridayPartyKicker}>it is happening</p>
          <p className={styles.fridayPartyTitle}>Today is Friday</p>
          <p className={styles.fridayPartySubline}>Party mode unlocked for all Friday lovers. ✨</p>
        </div>
      ) : (
        <div role="timer" aria-label="Countdown to next Friday" aria-live="off">
          <p className={styles.fridayCountdownLabel}>Countdown to next Friday</p>
          <div className={styles.fridayCountdownGrid}>
            <div className={styles.fridayCountdownItem}>
              <span>{countdown.days}</span>
              <small>days</small>
            </div>
            <div className={styles.fridayCountdownItem}>
              <span>{countdown.hours}</span>
              <small>hours</small>
            </div>
            <div className={styles.fridayCountdownItem}>
              <span>{countdown.minutes}</span>
              <small>minutes</small>
            </div>
            <div className={styles.fridayCountdownItem}>
              <span>{countdown.seconds}</span>
              <small>seconds</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
