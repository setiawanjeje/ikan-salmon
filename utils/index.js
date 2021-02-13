import { format } from "date-fns";
import startCase from "lodash/startCase";

export const parseIDR = (stringPrice) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(stringPrice);
};

export const parseDate = (dateString) => {
  return format(new Date(dateString), "ccc, d MMM y");
};

export const parseTime = (timestampString) => {
  return format(Number(timestampString), "hh:mm");
};

export const formatStartCase = (string) => {
  if (!string) return null;
  return startCase(string.toLowerCase());
};

export const sortArrOfObjByString = (arrayOfObj, key) => {
  let arr = arrayOfObj;
  arr.sort((a, b) => {
    const nameA = a[key] ? a[key].toLowerCase() : "";
    const nameB = b[key] ? b[key].toLowerCase() : "";
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });
  return arr;
};

export const sortArrOfObjByNumber = (arrayOfObj, key) => {
  let arr = arrayOfObj;
  arr.sort(function (a, b) {
    return Number(a[key]) - Number(b[key]);
  });
  return arr;
};

export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
