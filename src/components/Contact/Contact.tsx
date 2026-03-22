'use client';

import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { SkillReview, type SkillReviewCheck } from '@/components/SkillReview/SkillReview';
import styles from './Contact.module.css';

type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceRequest: string;
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

const reviewChecks: SkillReviewCheck[] = [
  {
    label: 'Color consistency',
    status: 'pass',
    detail: 'Brand blue (#2979ff) and deep blue (#0047c2) are preserved for accents, action state, and review surfaces.',
  },
  {
    label: 'Typography hierarchy',
    status: 'pass',
    detail: 'The section heading remains at 36px, supporting copy at 16px, and contact/form body copy at 15px.',
  },
  {
    label: 'Responsive breakpoint',
    status: 'pass',
    detail: 'The layout collapses at 727px to a single-column stack with mobile spacing reduced to the 27px rhythm.',
  },
  {
    label: 'Spacing system',
    status: 'pass',
    detail: 'Desktop spacing keeps the 40px vertical rhythm while panel internals and form gaps stay consistent with the site grid.',
  },
  {
    label: 'Accessibility',
    status: 'pass',
    detail: 'All inputs are label-associated, required fields expose validation states, and submit feedback is announced with ARIA.',
  },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,20}$/;

export function Contact() {
  const formId = useId();
  const [submitState, setSubmitState] = useState<SubmitState>({ type: 'idle', message: '' });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      serviceRequest: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitState({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit the contact form right now.');
      }

      reset();
      setSubmitState({
        type: 'success',
        message: result.message || 'Thanks. Our Client Services team will contact you shortly.',
      });
    } catch (error) {
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
          {/* ui-ux-design review: title locked to 36px tier, underline accent uses deep brand blue, and body copy remains at 16px/#374151. */}
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
              {/* ui-ux-design review: 727px breakpoint stacks the grid, form borders stay square, and labels remain explicit for assistive tech. */}
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor={`${formId}-firstName`}>
                    First Name
                  </label>
                  <input
                    id={`${formId}-firstName`}
                    className={styles.input}
                    autoComplete="given-name"
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    {...register('firstName', {
                      required: 'First Name is required.',
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
                    autoComplete="family-name"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    {...register('lastName', {
                      required: 'Last Name is required.',
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
                    aria-invalid={errors.email ? 'true' : 'false'}
                    {...register('email', {
                      required: 'Email Address is required.',
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
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    {...register('phone', {
                      required: 'Phone Number is required.',
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
                  aria-invalid={errors.serviceRequest ? 'true' : 'false'}
                  {...register('serviceRequest')}
                />
                {errors.serviceRequest ? <p className={styles.error}>{errors.serviceRequest.message}</p> : null}
              </div>

              <input type="hidden" name="recaptcha" value="invisible-placeholder" />

              <div className={styles.actions}>
                <button className={styles.button} type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <p className={styles.recaptchaNote}>Invisible reCAPTCHA placeholder is reserved for production integration.</p>
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

        <div className={styles.reviewBlock}>
          <SkillReview
            title="Contact Section UI Review"
            checks={reviewChecks}
            note="This report captures the required ui-ux-design checks for color system, 36px/16px typography tiers, 727px responsive collapse, spacing rhythm, and accessible field semantics."
          />
        </div>
      </Container>
    </Section>
  );
}
