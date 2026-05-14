export function relativeDate(dateStr: string): { relative: string; absolute: string } {
  const date = new Date(dateStr);
  const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);

  let relative: string;
  if (diffSecs < 60)              relative = 'just now';
  else if (diffSecs < 3600)       relative = `${Math.floor(diffSecs / 60)}m ago`;
  else if (diffSecs < 86400)      relative = `${Math.floor(diffSecs / 3600)}h ago`;
  else if (diffSecs < 604800)     relative = `${Math.floor(diffSecs / 86400)}d ago`;
  else if (diffSecs < 2592000)    relative = `${Math.floor(diffSecs / 604800)}w ago`;
  else if (diffSecs < 31536000)   relative = `${Math.floor(diffSecs / 2592000)}mo ago`;
  else                            relative = `${Math.floor(diffSecs / 31536000)}y ago`;

  const absolute = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });

  return { relative, absolute };
}
