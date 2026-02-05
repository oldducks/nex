// Password validation rules (Gmail standard)
export const passwordRules = [
    { id: 'length', label: 'อย่างน้อย 8 ตัวอักษร', test: (p: string) => p.length >= 8 },
    { id: 'uppercase', label: 'มีตัวพิมพ์ใหญ่ (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: 'มีตัวพิมพ์เล็ก (a-z)', test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: 'มีตัวเลข (0-9)', test: (p: string) => /[0-9]/.test(p) },
    { id: 'symbol', label: 'มีสัญลักษณ์ (!@#$%^&*)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export function validatePassword(password: string) {
    const passed = passwordRules.filter(rule => rule.test(password)).length;
    return {
        rules: passwordRules.map(rule => ({ ...rule, passed: rule.test(password) })),
        passed,
        total: passwordRules.length,
        isValid: passed === passwordRules.length,
        percentage: (passed / passwordRules.length) * 100
    };
}

export function getStrengthColor(passed: number) {
    if (passed <= 1) return 'bg-red-500';
    if (passed <= 2) return 'bg-orange-500';
    if (passed <= 3) return 'bg-yellow-500';
    if (passed <= 4) return 'bg-blue-500';
    return 'bg-green-500';
}

export function getStrengthLabel(passed: number) {
    if (passed <= 1) return 'อ่อนมาก';
    if (passed <= 2) return 'อ่อน';
    if (passed <= 3) return 'ปานกลาง';
    if (passed <= 4) return 'แข็งแรง';
    return 'แข็งแรงมาก';
}
