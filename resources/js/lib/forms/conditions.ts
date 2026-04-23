export type ConditionOp = 'eq' | 'neq' | 'in';

export interface ConditionRule {
    field: string;
    op: ConditionOp;
    value: unknown;
}

/**
 * Mirrors app/Support/ConditionEvaluator.php.
 *
 * `field` is a dot-path into the top-level `answers` object. A missing rule
 * (or a rule without required properties) is always satisfied.
 */
export function evalRule(rule: ConditionRule | null | undefined, values: Record<string, unknown>): boolean {
    if (!rule || !rule.field || !rule.op) return true;
    const current = getPath(values, rule.field);
    const target = rule.value;
    switch (rule.op) {
        case 'eq':
            return current === target;
        case 'neq':
            return current !== target;
        case 'in':
            return Array.isArray(target) && target.includes(current as never);
        default:
            return true;
    }
}

function getPath(obj: unknown, dotPath: string): unknown {
    if (obj == null) return undefined;
    const parts = dotPath.split('.');
    let cur: unknown = obj;
    for (const part of parts) {
        if (cur == null || typeof cur !== 'object') return undefined;
        cur = (cur as Record<string, unknown>)[part];
    }
    return cur;
}
