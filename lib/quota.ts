// lib/quota.ts
import { sql } from "@/lib/db";

const FREE_LIMIT = parseInt(process.env.QUOTA_FREE_LIMIT ?? "5", 10);
const PREMIUM_LIMIT = parseInt(process.env.QUOTA_PREMIUM_LIMIT ?? "50", 10);


const IS_DEV_BYPASS =
  process.env.NODE_ENV !== "production" && process.env.QUOTA_DEV_BYPASS === "1";

export async function checkQuota(userId: string): Promise<boolean> {
  if (IS_DEV_BYPASS) return true;

  try {
    const res = await sql`SELECT * FROM user_quotas WHERE userId = ${userId}`;
    let userQuota = Array.isArray(res) ? res[0] : res;

    const now = new Date();
    if (userQuota && shouldResetQuota(userQuota.lastreset || userQuota.lastReset)) {
      await sql`UPDATE user_quotas SET uploadsThisMonth = 0, lastReset = ${now} WHERE userId = ${userId}`;
      userQuota = { ...userQuota, uploadsthismonth: 0, lastreset: now };
    }

    if (!userQuota) {
      const created = await sql`
        INSERT INTO user_quotas (userId, uploadsThisMonth, lastReset, plan)
        VALUES (${userId}, 0, ${now}, 'free')
        RETURNING *
      `;
      userQuota = Array.isArray(created) ? created[0] : created;
    }

    const max = userQuota.plan === "premium" ? PREMIUM_LIMIT : FREE_LIMIT;
    const cur = userQuota.uploadsthismonth || userQuota.uploadsThisMonth || 0;
    return cur < max;
  } catch (e) {
    console.error("Error checking quota:", e);
    return false;
  }
}

export async function incrementQuota(userId: string): Promise<void> {
  if (IS_DEV_BYPASS) return;

  try {
    const res = await sql`SELECT * FROM user_quotas WHERE userId = ${userId}`;
    const userQuota = Array.isArray(res) ? res[0] : res;

    if (userQuota) {
      await sql`
        UPDATE user_quotas
        SET uploadsThisMonth = uploadsThisMonth + 1, updatedAt = NOW()
        WHERE userId = ${userId}
      `;
    } else {
      await sql`
        INSERT INTO user_quotas (userId, uploadsThisMonth, lastReset, plan)
        VALUES (${userId}, 1, NOW(), 'free')
      `;
    }
  } catch (e) {
    console.error("Error incrementing quota:", e);
  }
}

export async function getQuotaStatus(userId: string): Promise<{
  current: number;
  max: number;
  plan: string;
  canUpload: boolean;
}> {
  if (IS_DEV_BYPASS) {
    return { current: 0, max: 9999, plan: "dev", canUpload: true };
  }

  try {
    const res = await sql`SELECT * FROM user_quotas WHERE userId = ${userId}`;
    let userQuota = Array.isArray(res) ? res[0] : res;

    const now = new Date();
    if (userQuota && shouldResetQuota(userQuota.lastreset || userQuota.lastReset)) {
      await sql`UPDATE user_quotas SET uploadsThisMonth = 0, lastReset = ${now} WHERE userId = ${userId}`;
      userQuota = { ...userQuota, uploadsthismonth: 0, lastreset: now };
    }

    if (!userQuota) {
      return { current: 0, max: FREE_LIMIT, plan: "free", canUpload: true };
    }

    const max = userQuota.plan === "premium" ? PREMIUM_LIMIT : FREE_LIMIT;
    const cur = userQuota.uploadsthismonth || userQuota.uploadsThisMonth || 0;

    return { current: cur, max, plan: userQuota.plan, canUpload: cur < max };
  } catch (e) {
    console.error("Error getting quota status:", e);
    return { current: 0, max: FREE_LIMIT, plan: "free", canUpload: true };
  }
}

export async function resetQuota(userId: string) {
  await sql`UPDATE user_quotas SET uploadsThisMonth = 0, lastReset = NOW() WHERE userId = ${userId}`;
}

export async function setPlan(userId: string, plan: "free" | "premium") {
  await sql`INSERT INTO user_quotas (userId, plan)
            VALUES (${userId}, ${plan})
            ON CONFLICT (userId) DO UPDATE SET plan = ${plan}, updatedAt = NOW()`;
}

function shouldResetQuota(lastReset: Date): boolean {
  const now = new Date();
  const last = new Date(lastReset);
  return now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
}
