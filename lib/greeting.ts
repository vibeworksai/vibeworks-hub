/**
 * Get time-based greeting for the user
 * Always uses Eastern Time (America/New_York)
 */
export function getGreeting(firstName?: string): string {
  const now = new Date();
  
  // Get hour in Eastern Time
  const etHour = parseInt(
    now.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false
    })
  );

  let greeting = '';
  
  if (etHour >= 5 && etHour < 12) {
    greeting = 'Good morning';
  } else if (etHour >= 12 && etHour < 17) {
    greeting = 'Good afternoon';
  } else if (etHour >= 17 && etHour < 22) {
    greeting = 'Good evening';
  } else {
    greeting = 'Working late';
  }

  return firstName ? `${greeting}, ${firstName}` : greeting;
}

/**
 * Get contextual subtitle based on time of day
 */
export function getGreetingSubtitle(): string {
  const now = new Date();
  
  const etHour = parseInt(
    now.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false
    })
  );

  if (etHour >= 5 && etHour < 12) {
    return 'Ready to crush today?';
  } else if (etHour >= 12 && etHour < 17) {
    return 'Keep the momentum going.';
  } else if (etHour >= 17 && etHour < 22) {
    return 'Wrapping up the day strong.';
  } else {
    return 'Burning the midnight oil.';
  }
}
