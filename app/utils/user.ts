import { UserJSON } from '@clerk/backend';

export function getUserDisplayName(user: UserJSON | undefined) {
  if (!user) return null;

  // Priority order for display name:
  // 1. username
  // 2. first_name + last_name
  // 3. first_name
  // 4. primary_email_address_id (if email_addresses array is available)
  // 5. "Unknown User"

  if (user.username) {
    return user.username;
  }

  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }

  if (user.first_name) {
    return user.first_name;
  }

  if (user.primary_email_address_id && user.email_addresses.length > 0) {
    const primaryEmail = user.email_addresses.find(
      (email) => email.id === user.primary_email_address_id,
    );
    if (primaryEmail) {
      return primaryEmail.email_address;
    }
  }

  return 'Unknown User';
}
