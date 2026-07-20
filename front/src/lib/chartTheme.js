// Values copied verbatim from the validated reference palette (dataviz skill).
export const chartTheme = {
  light: {
    ink: '#0b0b0b',
    inkSecondary: '#52514e',
    inkMuted: '#898781',
    grid: '#e1e0d9',
    axis: '#c3c2b7',
    blue: '#2a78d6',
    blueFillFrom: '#cde2fb',
    good: '#0ca30c',
    warning: '#fab219',
    serious: '#ec835a',
    critical: '#d03b3b',
    neutral: '#c3c2b7',
  },
  dark: {
    ink: '#ffffff',
    inkSecondary: '#c3c2b7',
    inkMuted: '#898781',
    grid: '#2c2c2a',
    axis: '#383835',
    blue: '#3987e5',
    blueFillFrom: '#184f95',
    good: '#0ca30c',
    warning: '#fab219',
    serious: '#ec835a',
    critical: '#d03b3b',
    neutral: '#52514e',
  },
}

export function gradeBucketColor(bucket, mode) {
  const t = chartTheme[mode]
  if (bucket === '0-59') return t.critical
  if (bucket === '60-69') return t.warning
  if (bucket === '70-84') return t.blue
  return t.good
}
