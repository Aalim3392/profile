export function getNotificationTarget(notification, role) {
  const title = String(notification.title || '').toLowerCase();
  const message = String(notification.message || '').toLowerCase();
  const content = `${title} ${message}`;
  const base = role === 'admin' ? '/admin' : '/employee';

  if (content.includes('task')) return `${base}/tasks`;
  if (content.includes('leave')) return `${base}/leaves`;
  if (content.includes('ticket') || content.includes('support')) return `${base}/tickets`;
  if (content.includes('interview')) return role === 'admin' ? '/admin/interviews' : '/employee/interview-prep';
  if (content.includes('hiring') || content.includes('application')) return '/admin/jobs';
  return `${base}/notifications`;
}
