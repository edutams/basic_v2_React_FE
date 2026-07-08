
// Groups a batch's fee list by fee name. Since a fee can have a
// different amount per class, this shows a single amount when all
// classes agree, or a range when they don't — never a false total.
export const getFeeSummary = (payments = []) => {
    const grouped = {};
    payments.forEach((p) => {
        if (!grouped[p.id]) grouped[p.id] = { name: p.name, amounts: [] };
        grouped[p.id].amounts.push(p.amount || 0);
    });

    return Object.values(grouped).map((fee) => {
        const min = Math.min(...fee.amounts);
        const max = Math.max(...fee.amounts);
        return { name: fee.name, amount: min, maxAmount: max, isRange: min !== max };
    });
};
