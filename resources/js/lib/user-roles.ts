/** Privileged write roles — may override cancelled / revision-request row locks. */
export function isGtcAdminUser(roles: readonly string[]): boolean {
    return roles.some(
        (role) => role === 'Admin' || role === 'Super Admin',
    );
}
