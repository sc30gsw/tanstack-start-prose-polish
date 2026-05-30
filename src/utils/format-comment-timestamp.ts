import dayjs from "dayjs";

export function formatCommentTimestamp(createdAt: Date) {
  const t = dayjs(createdAt);
  const commentDay = t.startOf("day");
  const today = dayjs().startOf("day");
  const dayDiff = today.diff(commentDay, "day");

  if (dayDiff === 0) {
    return `今日 ${t.format("HH:mm")}`;
  }

  if (dayDiff === 1) {
    return `昨日 ${t.format("HH:mm")}`;
  }

  return t.format("YYYY/MM/DD HH:mm");
}
