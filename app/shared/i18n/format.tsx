import { Fragment, type ReactNode } from "react";

// 字典裡的 {name} 換成實際的值。"共 {total} 隻" + { total: 3 } → "共 3 隻"
export function formatMessage(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

// 跟 formatMessage 一樣，但值可以是元件，例如數字要包 <strong>。
// 各語系的語序不同，所以整句放在字典，不在元件裡拼
export function formatNodes(
  template: string,
  values: Record<string, ReactNode>,
): ReactNode[] {
  return template.split(/(\{\w+\})/).map((part, index) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return key && key in values ? (
      <Fragment key={index}>{values[key]}</Fragment>
    ) : (
      part
    );
  });
}
