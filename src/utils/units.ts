const MILLISECONDS = 1
const SECONDS = 1000 * MILLISECONDS
const MINUTES = 60 * SECONDS
const HOURS = 60 * MINUTES

export default {
  NANOSECONDS: 1 / (1000 * 1000),
  MICROSECONDS: 1 / 1000,
  MILLISECONDS: MILLISECONDS,
  SECONDS: SECONDS,
  MINUTES: MINUTES,
  HOURS: HOURS,
  DAYS: 24 * HOURS
}
