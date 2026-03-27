export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function getNextFridayCountdown(now: Date): CountdownParts {
  const target = new Date(now);
  target.setHours(0, 0, 0, 0);

  const day = now.getDay();
  let daysUntil = (5 - day + 7) % 7;
  const isAlreadyFriday =
    day === 5 &&
    (now.getHours() > 0 ||
      now.getMinutes() > 0 ||
      now.getSeconds() > 0 ||
      now.getMilliseconds() > 0);

  if (isAlreadyFriday) {
    daysUntil = 7;
  }

  target.setDate(target.getDate() + daysUntil);

  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}
