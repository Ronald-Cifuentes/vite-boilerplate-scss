import { FC } from 'react'
import type { AnnouncerProps } from './interfaces'
import styles from './Announcer.module.scss'

/**
 * Visually hidden aria-live region for screen reader announcements.
 * The message prop is rendered directly - screen readers will announce
 * changes to the live region content automatically.
 *
 * For consecutive identical messages, the caller should include a timestamp
 * or counter in the message to ensure the SR picks up the change.
 */
export const Announcer: FC<AnnouncerProps> = ({
  message,
  politeness = 'polite',
  dataTestId = 'announcer',
}) => {
  return (
    <div
      role='status'
      aria-live={politeness}
      aria-atomic='true'
      className={styles.announcer}
      data-testid={dataTestId}
    >
      {message}
    </div>
  )
}
