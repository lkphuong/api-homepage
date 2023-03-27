export const replaceAll = (input: string, regex = /\s/) =>
  input.split(regex).join('');

export const convertString2JSON = (messages: string[]) => {
  let data: { [key: string]: string | { [key: string]: string }[] } = {};
  let arrs: Map<string, { [key: string]: string }[]> = new Map();

  if (messages && Array.isArray(messages)) {
    //#region Convert string to JSON
    for (const item of messages) {
      try {
        data = convertString2JSONObjectSingleProperty(data, item);
      } catch {
        try {
          arrs = convertString2JSONArray(arrs, item);
        } catch (e) {
          try {
            data = convertString2JSONObjectMultipleProperties(data, item);
          } catch (e) {
            data = {};
            break;
          }
        }
      }
    }
    //#endregion

    data = appendMap2JSONObject(arrs, data);
  }

  return data;
};

const convertString2JSONArray = (
  arrs: Map<string, { [key: string]: string }[]>,
  item: string,
) => {
  const first_brace_index = item.indexOf('{');
  if (first_brace_index !== -1) {
    const prefix = item.substring(0, first_brace_index);
    const payload = item.substring(first_brace_index, item.length);
    const key = prefix.split(/(\.[0-9]\.)/)[0];
    const index = parseInt(
      prefix
        .split(/(\.[0-9]\.)/)[1]
        .split(/\./)
        .join(''),
    );

    if (arrs.has(key)) {
      const value = JSON.parse(payload);
      value.index = index;
      arrs.get(key).push(value);
    } else {
      const value = JSON.parse(payload);
      value.index = index;
      arrs.set(key, [value]);
    }
  }

  return arrs;
};

const convertString2JSONObjectSingleProperty = (
  data: { [key: string]: string | { [key: string]: string }[] },
  item: string,
) => {
  const value = JSON.parse(item) as { [key: string]: string };
  data = {
    ...data,
    ...value,
  };

  return data;
};

const convertString2JSONObjectMultipleProperties = (
  data: { [key: string]: string | { [key: string]: string }[] },
  item: string,
) => {
  const first_brace_index = item.indexOf('{');
  if (first_brace_index !== -1) {
    const payload = item.substring(first_brace_index, item.length);
    const value = JSON.parse(payload) as { [key: string]: string };
    data = {
      ...data,
      ...value,
    };
  }

  return data;
};

const appendMap2JSONObject = (
  arrs: Map<string, { [key: string]: string }[]>,
  data: { [key: string]: string | { [key: string]: string }[] },
) => {
  if (arrs && arrs.size > 0) {
    for (const key of arrs.keys()) {
      data[key] = arrs.get(key);
    }
  }

  return data;
};
