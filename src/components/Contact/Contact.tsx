'use client';

import { useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { trackEvent } from '@/lib/analytics';
import styles from './Contact.module.css';

type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceRequest: string;
  company: string;
};

type SubmitState = {
  type: 'idle' | 'success' | 'error';
  message: string;
};

type ContactItem = {
  icon: string;
  label: string;
  value: string;
  href?: string;
};

const contactItems: ContactItem[] = [
  {
    icon: '📍',
    label: 'Address',
    value: '2100C 52e Avenue Dock:5-6-7, Lachine, QC H8T 2Y5',
  },
  {
    icon: '🕒',
    label: 'Business hours',
    value: 'Mon-Fri 9:00AM-4:30PM',
  },
  {
    icon: '📱',
    label: 'Phone',
    value: '438-488-5382',
    href: 'tel:4384885382',
  },
  {
    icon: '✉',
    label: 'Email',
    value: 'ops@fywarehouse.com',
    href: 'mailto:ops@fywarehouse.com',
  },
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,20}$/;

export function Contact() {
  const formId = useId();
  const [submitState, setSubmitState] = useState<SubmitState>({ type: 'idle', message: '' });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ContactFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      serviceRequest: '',
      company: '',
    },
    mode: 'onBlur',
  });

  const serviceRequestLength = watch('serviceRequest')?.trim().length ?? 0;
  const hasUserInput = useMemo(() => Object.keys(dirtyFields).length > 0, [dirtyFields]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitState({ type: 'idle', message: '' });

    if (values.company.trim()) {
      setError('company', {
        type: 'manual',
        message: 'Spam protection was triggered. Please clear the hidden field and try again.',
      });
      setSubmitState({
        type: 'error',
        message: 'Unable to submit the contact form right now.',
      });
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          recaptcha: values.company,
        }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit the contact form right now.');
      }

      trackEvent('contact_form_submit_success', {
        form_id: 'contact-us',
      });

      reset();
      setSubmitState({
        type: 'success',
        message: result.message || 'Thanks. Our Client Services team will contact you shortly.',
      });
    } catch (error) {
      trackEvent('contact_form_submit_error', {
        form_id: 'contact-us',
      });
      setSubmitState({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to submit the contact form right now.',
      });
    }
  });

  return (
    <Section id="contact-us">
      <Container>
        <div className={styles.header}>
          <h2>Get Our Service</h2>
          <p>Fill out the form below, and our Client Services team will contact you to kickstart the process.</p>
        </div>

        <div className={styles.columns}>
          <div className={styles.infoPanel}>
            <div className={styles.infoInner}>
              {contactItems.map((item) => (
                <div key={item.label} className={styles.infoRow}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <div className={styles.infoContent}>
                    <p className={styles.infoLabel}>{item.label}</p>
                    {item.href ? (
                      <a className={styles.infoValue} href={item.href}>
                        {item.value}
                      </a>
                    ) : (
                      <p className={styles.infoValue}>{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formPanel}>
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor={`${formId}-firstName`}>
                    First Name
                  </label>
                  <input
                    id={`${formId}-firstName`}
                    className={styles.input}
                    type="text"
                    autoComplete="given-name"
                    enterKeyHint="next"
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    {...register('firstName', {
                      required: 'First Name is required.',
                      maxLength: {
                        value: 80,
                        message: 'First Name is too long.',
                      },
                    })}
                  />
                  {errors.firstName ? <p className={styles.error}>{errors.firstName.message}</p> : null}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor={`${formId}-lastName`}>
                    Last Name
                  </label>
                  <input
                    id={`${formId}-lastName`}
                    className={styles.input}
                    type="text"
                    autoComplete="family-name"
                    enterKeyHint="next"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    {...register('lastName', {
                      required: 'Last Name is required.',
                      maxLength: {
                        value: 80,
                        message: 'Last Name is too long.',
                      },
                    })}
                  />
                  {errors.lastName ? <p className={styles.error}>{errors.lastName.message}</p> : null}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor={`${formId}-email`}>
                    Email Address
                  </label>
                  <input
                    id={`${formId}-email`}
                    className={styles.input}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    enterKeyHint="next"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    {...register('email', {
                      required: 'Email Address is required.',
                      maxLength: {
                        value: 160,
                        message: 'Email Address is too long.',
                      },
                      pattern: {
                        value: emailPattern,
                        message: 'Enter a valid email address.',
                      },
                    })}
                  />
                  {errors.email ? <p className={styles.error}>{errors.email.message}</p> : null}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor={`${formId}-phone`}>
                    Phone Number
                  </label>
                  <input
                    id={`${formId}-phone`}
                    className={styles.input}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    enterKeyHint="next"
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    {...register('phone', {
                      required: 'Phone Number is required.',
                      maxLength: {
                        value: 30,
                        message: 'Phone Number is too long.',
                      },
                      pattern: {
                        value: phonePattern,
                        message: 'Enter a valid phone number.',
                      },
                    })}
                  />
                  {errors.phone ? <p className={styles.error}>{errors.phone.message}</p> : null}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor={`${formId}-serviceRequest`}>
                  Which warehouse and distribution service are you looking for?
                </label>
                <textarea
                  id={`${formId}-serviceRequest`}
                  className={styles.textarea}
                  rows={6}
                  enterKeyHint="send"
                  aria-invalid={errors.serviceRequest ? 'true' : 'false'}
                  {...register('serviceRequest', {
                    maxLength: {
                      value: 5000,
                      message: 'Service Request is too long.',
                    },
                  })}
                />
                <div className={styles.fieldMeta}>
                  {errors.serviceRequest ? <p className={styles.error}>{errors.serviceRequest.message}</p> : <span />}
                  <p className={styles.counter} aria-live="polite">
                    {serviceRequestLength}/5000
                  </p>
                </div>
              </div>

              <div className={styles.honeypot} aria-hidden="true">
                <label className={styles.label} htmlFor={`${formId}-company`}>
                  Company
                </label>
                <input
                  id={`${formId}-company`}
                  className={styles.input}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register('company')}
                />
              </div>

              <div className={styles.actions}>
                <button className={styles.button} type="submit" disabled={isSubmitting || !hasUserInput}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <p className={styles.recaptchaNote}>
                  Server-side origin checks, rate limiting, and SMTP delivery are active. Add mail env vars in deployment to enable live delivery.
                </p>
              </div>

              {submitState.message ? (
                <p
                  className={`${styles.feedback} ${submitState.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}
                  role="status"
                  aria-live="polite"
                >
                  {submitState.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>

      </Container>
    </Section>
  );
}
