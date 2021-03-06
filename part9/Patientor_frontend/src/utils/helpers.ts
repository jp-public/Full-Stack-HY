export const isDate = (date: string): boolean => {
  return Boolean(Date.parse(date));
};

export const isOptionalDate = (date: string): boolean => {
  if (date === "") {
    return true;
  }
  return Boolean(Date.parse(date));
};

export const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
};
