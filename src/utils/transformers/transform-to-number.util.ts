interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

export function transformToNumberUtil(
  value: string,
  opts: ToNumberOptions = {},
): number {
  let newValue: number = Number.parseFloat(value || String(opts.default));

  if (Number.isNaN(newValue)) {
    newValue = opts.default;
  }

  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }

    if (newValue > opts.max) {
      newValue = opts.max;
    }
  }

  return newValue;
}
