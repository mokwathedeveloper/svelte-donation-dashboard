// @ts-nocheck
import type { PageServerLoad } from './$types';
import { Transaction } from '$lib/models/Transaction';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
        Transaction.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Transaction.countDocuments({})
    ]);

    return {
        transactions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}; 