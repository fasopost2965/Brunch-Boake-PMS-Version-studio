import React from 'react';
import styles from './Table.module.css';

interface Column<T> {
  key: string | keyof T;
  title: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string | number;
  emptyMessage?: string;
}

export function Table<T>({ columns, data, rowKey, emptyMessage = 'Aucune donnée disponible.' }: TableProps<T>) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={String(col.key) + index} className={styles.th}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.td} style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="text-body-sm">{emptyMessage}</span>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={rowKey(item)} className={styles.tr}>
                {columns.map((col, index) => (
                  <td key={String(col.key) + index} className={styles.td}>
                    {col.render ? col.render(item) : String(item[col.key as keyof T])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
