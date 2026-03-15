/**
 * @fileoverview Form Components
 * @module @ui/components/Form
 *
 * Form components including Form container, FormItem wrapper,
 * FormLabel, FormError, and FormDescription components.
 */

import React, {
  forwardRef,
  createContext,
  useContext,
  useRef,
  useImperativeHandle,
  ReactNode,
  FormHTMLAttributes,
  HTMLAttributes,
} from 'react';
import './styles.css';

// ============================================
// Types
// ============================================

export interface FormFieldState {
  /** Field name */
  name: string;
  /** Field has error */
  hasError?: boolean;
  /** Error message */
  error?: string;
  /** Field is touched */
  touched?: boolean;
  /** Field is dirty */
  dirty?: boolean;
}

export interface FormContextValue {
  /** Form field states */
  fields: Record<string, FormFieldState>;
  /** Register a field */
  registerField: (name: string) => void;
  /** Unregister a field */
  unregisterField: (name: string) => void;
  /** Set field error */
  setFieldError: (name: string, error: string | undefined) => void;
  /** Set field touched */
  setFieldTouched: (name: string, touched: boolean) => void;
  /** Get field state */
  getFieldState: (name: string) => FormFieldState | undefined;
  /** Form is submitting */
  isSubmitting?: boolean;
  /** Submit form */
  submit?: () => void;
  /** Reset form */
  reset?: () => void;
}

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Form context value */
  formContext?: FormContextValue;
  /** Custom class name */
  className?: string;
  /** Children */
  children: ReactNode;
  /** On submit callback */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export interface FormRef {
  /** Submit the form */
  submit: () => void;
  /** Reset the form */
  reset: () => void;
  /** Get form element */
  getFormElement: () => HTMLFormElement | null;
}

export interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Field name */
  name?: string;
  /** Label text */
  label?: ReactNode;
  /** Error message */
  error?: ReactNode;
  /** Description text */
  description?: ReactNode;
  /** Required field indicator */
  required?: boolean;
  /** Custom class name */
  className?: string;
  /** Children (form control) */
  children: ReactNode;
}

export interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
  /** Field name (for attribute) */
  htmlFor?: string;
  /** Required field indicator */
  required?: boolean;
  /** Custom class name */
  className?: string;
  /** Children */
  children: ReactNode;
}

export interface FormErrorProps extends HTMLAttributes<HTMLDivElement> {
  /** Error message */
  error?: ReactNode;
  /** Custom class name */
  className?: string;
}

export interface FormDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  /** Description text */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
}

// ============================================
// Form Context
// ============================================

const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue | null {
  return useContext(FormContext);
}

// ============================================
// Form Component
// ============================================

export const Form = forwardRef<FormRef, FormProps>(
  (
    {
      formContext,
      className = '',
      children,
      onSubmit,
      ...restProps
    },
    ref
  ) => {
    const formRef = useRef<HTMLFormElement>(null);

    // Expose methods
    useImperativeHandle(ref, () => ({
      submit: () => {
        formRef.current?.requestSubmit();
      },
      reset: () => {
        formRef.current?.reset();
        formContext?.reset?.();
      },
      getFormElement: () => formRef.current,
    }));

    // Handle submit
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.(e);
    };

    // Build class name
    const formClasses = ['form', className].filter(Boolean).join(' ');

    return (
      <FormContext.Provider value={formContext || null}>
        <form
          ref={formRef}
          className={formClasses}
          onSubmit={handleSubmit}
          noValidate
          {...restProps}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';

// ============================================
// FormItem Component
// ============================================

export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  (
    {
      name,
      label,
      error,
      description,
      required = false,
      className = '',
      children,
      ...restProps
    },
    ref
  ) => {
    const formContext = useFormContext();
    const fieldState = name ? formContext?.getFieldState(name) : undefined;
    const hasError = error || fieldState?.hasError;

    // Build class name
    const itemClasses = [
      'form-item',
      hasError && 'form-item--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={itemClasses} {...restProps}>
        {label && (
          <FormLabel required={required}>
            {label}
          </FormLabel>
        )}
        <div className="form-item__control">
          {children}
        </div>
        {hasError && (
          <FormError error={error || fieldState?.error} />
        )}
        {description && !hasError && (
          <FormDescription>{description}</FormDescription>
        )}
      </div>
    );
  }
);

FormItem.displayName = 'FormItem';

// ============================================
// FormLabel Component
// ============================================

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  (
    {
      htmlFor,
      required = false,
      className = '',
      children,
      ...restProps
    },
    ref
  ) => {
    // Build class name
    const labelClasses = [
      'form-label',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label
        ref={ref}
        className={labelClasses}
        htmlFor={htmlFor}
        {...restProps}
      >
        {children}
        {required && <span className="form-label__required">*</span>}
      </label>
    );
  }
);

FormLabel.displayName = 'FormLabel';

// ============================================
// FormError Component
// ============================================

export const FormError = forwardRef<HTMLDivElement, FormErrorProps>(
  (
    {
      error,
      className = '',
      ...restProps
    },
    ref
  ) => {
    if (!error) return null;

    // Build class name
    const errorClasses = ['form-error', className].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={errorClasses}
        role="alert"
        aria-live="polite"
        {...restProps}
      >
        <svg className="form-error__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="form-error__text">{error}</span>
      </div>
    );
  }
);

FormError.displayName = 'FormError';

// ============================================
// FormDescription Component
// ============================================

export const FormDescription = forwardRef<HTMLDivElement, FormDescriptionProps>(
  (
    {
      className = '',
      children,
      ...restProps
    },
    ref
  ) => {
    if (!children) return null;

    // Build class name
    const descClasses = ['form-description', className].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={descClasses}
        {...restProps}
      >
        {children}
      </div>
    );
  }
);

FormDescription.displayName = 'FormDescription';

// ============================================
// FormDivider Component
// ============================================

export interface FormDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom class name */
  className?: string;
}

export const FormDivider = forwardRef<HTMLDivElement, FormDividerProps>(
  (
    {
      className = '',
      ...restProps
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={['form-divider', className].filter(Boolean).join(' ')}
        {...restProps}
      />
    );
  }
);

FormDivider.displayName = 'FormDivider';

// ============================================
// FormGroup Component
// ============================================

export interface FormGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Group title */
  title?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Children */
  children: ReactNode;
}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  (
    {
      title,
      className = '',
      children,
      ...restProps
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={['form-group', className].filter(Boolean).join(' ')}
        {...restProps}
      >
        {title && <div className="form-group__title">{title}</div>}
        <div className="form-group__content">{children}</div>
      </div>
    );
  }
);

FormGroup.displayName = 'FormGroup';

export default Form;
