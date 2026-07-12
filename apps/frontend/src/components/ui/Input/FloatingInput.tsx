import React, { useId } from 'react';
import styles from './FloatingInput.module.css';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, ...props }, ref) => {
    const inputId = useId();

    return (
      <div className={styles.container}>
        <div className={styles.fieldWrapper}>
          <input
            id={inputId}
            ref={ref}
            placeholder=" " /* Obligatoire pour le déclencheur CSS :placeholder-shown */
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            {...props}
          />
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';
