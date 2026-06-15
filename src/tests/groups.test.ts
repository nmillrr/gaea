/**
 * Unit tests for the group controller & routes.
 *
 * These tests mock the TypeORM repositories so they run without a real database
 * (same approach as scoring.test.ts — no DB required).  They exercise:
 *
 * 1. Group creation (happy path + name validation + 3-group limit)
 * 2. Listing groups
 * 3. Getting a group by ID (membership gating)
 * 4. Adding members (owner-only, 20-member cap, duplicate check, user-group limit)
 * 5. Removing members (owner can remove anyone, member can leave, owner cannot be removed)
 */

import { Group } from '../entities/Group';
import { GroupMember, GroupMemberRole } from '../entities/GroupMember';

// ── Lightweight mock helpers ────────────────────────────────────────────────

/** Build a fake Request with the minimum shape our controllers read. */
function fakeReq(overrides: {
  user?: { id: string; email: string } | null;
  body?: Record<string, any>;
  params?: Record<string, string>;
  query?: Record<string, string>;
} = {}) {
  return {
    user: overrides.user !== undefined ? overrides.user : { id: 'u1', email: 'a@b.com' },
    body: overrides.body || {},
    params: overrides.params || {},
    query: overrides.query || {},
  } as any;
}

/** Build a fake Response that records the last status + json body. */
function fakeRes() {
  const r: any = {
    _status: 200,
    _body: null,
    status(code: number) {
      r._status = code;
      return r;
    },
    json(body: any) {
      r._body = body;
      return r;
    },
  };
  return r;
}

// ── Mock repository stores ──────────────────────────────────────────────────

let groupStore: Group[] = [];
let memberStore: GroupMember[] = [];
let userStore: Array<{ id: string; email: string; username: string }> = [];

/** next auto-increment UUID */
let nextId = 1;
function uuid() {
  return `mock-uuid-${nextId++}`;
}

// ── Mock TypeORM DataSource ─────────────────────────────────────────────────

jest.mock('../db/init', () => {
  const getRepository = (entity: any) => {
    const name = entity.name || entity;

    // ─ Group repository ─
    if (name === 'Group') {
      return {
        save: jest.fn(async (g: any) => {
          if (!g.id) g.id = uuid();
          if (!g.created_at) g.created_at = new Date().toISOString();
          groupStore.push(g);
          return g;
        }),
        findOne: jest.fn(async ({ where }: any) => {
          return groupStore.find((g) => g.id === where.id) || null;
        }),
        find: jest.fn(async ({ where }: any) => {
          if (where?.id?._value) {
            // In() wrapper
            return groupStore.filter((g) => where.id._value.includes(g.id));
          }
          return groupStore;
        }),
      };
    }

    // ─ GroupMember repository ─
    if (name === 'GroupMember') {
      return {
        save: jest.fn(async (m: any) => {
          if (!m.joined_at) m.joined_at = new Date().toISOString();
          memberStore.push(m);
          return m;
        }),
        findOne: jest.fn(async ({ where }: any) => {
          return (
            memberStore.find(
              (m) => m.group_id === where.group_id && m.user_id === where.user_id
            ) || null
          );
        }),
        find: jest.fn(async ({ where }: any) => {
          if (where?.user_id) {
            return memberStore.filter((m) => m.user_id === where.user_id);
          }
          return memberStore;
        }),
        count: jest.fn(async ({ where }: any) => {
          if (where?.group_id) {
            return memberStore.filter((m) => m.group_id === where.group_id).length;
          }
          if (where?.user_id) {
            return memberStore.filter((m) => m.user_id === where.user_id).length;
          }
          return memberStore.length;
        }),
        remove: jest.fn(async (m: any) => {
          memberStore = memberStore.filter(
            (x) => !(x.group_id === m.group_id && x.user_id === m.user_id)
          );
        }),
        createQueryBuilder: jest.fn(() => {
          let chain: any = {};
          const methods = [
            'select',
            'addSelect',
            'where',
            'groupBy',
            'innerJoin',
          ];
          methods.forEach((m) => {
            chain[m] = jest.fn(() => chain);
          });
          chain.getRawMany = jest.fn(async () => {
            // Count members per group
            const counts = new Map<string, number>();
            memberStore.forEach((m) => {
              counts.set(m.group_id, (counts.get(m.group_id) || 0) + 1);
            });
            return Array.from(counts.entries()).map(([group_id, count]) => ({
              group_id,
              count: String(count),
            }));
          });
          return chain;
        }),
      };
    }

    // ─ User repository ─
    if (name === 'User') {
      return {
        findOne: jest.fn(async ({ where }: any) => {
          return userStore.find((u) => u.id === where.id) || null;
        }),
      };
    }

    return {};
  };

  return {
    AppDataSource: {
      getRepository,
    },
  };
});

// We need the `In` function from typeorm to keep the import happy
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    In: (values: string[]) => ({ _type: 'in', _value: values }),
  };
});

// ── Import controller AFTER mocks are set up ────────────────────────────────

import {
  createGroup,
  listMyGroups,
  getGroup,
  addMember,
  removeMember,
} from '../controllers/groupController';

// ── Test suites ─────────────────────────────────────────────────────────────

describe('Group Controller', () => {
  beforeEach(() => {
    groupStore = [];
    memberStore = [];
    userStore = [
      { id: 'u1', email: 'owner@example.com', username: 'owner' },
      { id: 'u2', email: 'member@example.com', username: 'member' },
      { id: 'u3', email: 'outsider@example.com', username: 'outsider' },
    ];
    nextId = 1;
  });

  // ─────────────────────────────── CREATE ───────────────────────────────────

  describe('createGroup', () => {
    it('creates a group and makes the creator the owner member', async () => {
      const req = fakeReq({ body: { name: 'Travel Buddies' } });
      const res = fakeRes();

      await createGroup(req, res);

      expect(res._status).toBe(201);
      expect(res._body.name).toBe('Travel Buddies');
      expect(res._body.owner_id).toBe('u1');
      expect(res._body.member_count).toBe(1);

      // Owner should be in the member store
      expect(memberStore.length).toBe(1);
      expect(memberStore[0].role).toBe(GroupMemberRole.OWNER);
    });

    it('rejects empty names', async () => {
      const req = fakeReq({ body: { name: '  ' } });
      const res = fakeRes();

      await createGroup(req, res);

      expect(res._status).toBe(400);
    });

    it('rejects missing auth', async () => {
      const req = fakeReq({ user: null, body: { name: 'Test' } });
      const res = fakeRes();

      await createGroup(req, res);

      expect(res._status).toBe(401);
    });

    it('enforces the 3-group limit per user', async () => {
      // Pre-populate 3 groups
      for (let i = 0; i < 3; i++) {
        memberStore.push({
          group_id: `existing-${i}`,
          user_id: 'u1',
          role: GroupMemberRole.MEMBER,
        } as GroupMember);
      }

      const req = fakeReq({ body: { name: 'Too Many' } });
      const res = fakeRes();

      await createGroup(req, res);

      expect(res._status).toBe(403);
      expect(res._body.message).toMatch(/maximum/i);
    });
  });

  // ─────────────────────────────── LIST ─────────────────────────────────────

  describe('listMyGroups', () => {
    it('returns empty array when user has no groups', async () => {
      const req = fakeReq();
      const res = fakeRes();

      await listMyGroups(req, res);

      expect(res._status).toBe(200);
      expect(res._body).toEqual([]);
    });

    it('returns groups the user belongs to', async () => {
      // Seed a group + membership
      const g = { id: 'g1', name: 'Test Group', owner_id: 'u1', created_at: new Date() } as Group;
      groupStore.push(g);
      memberStore.push({ group_id: 'g1', user_id: 'u1', role: GroupMemberRole.OWNER } as GroupMember);

      const req = fakeReq();
      const res = fakeRes();

      await listMyGroups(req, res);

      expect(res._status).toBe(200);
      expect(res._body.length).toBe(1);
      expect(res._body[0].id).toBe('g1');
      expect(res._body[0].member_count).toBe(1);
    });
  });

  // ─────────────────────────────── GET ──────────────────────────────────────

  describe('getGroup', () => {
    beforeEach(() => {
      groupStore.push({ id: 'g1', name: 'Group One', owner_id: 'u1', created_at: new Date() } as Group);
      memberStore.push({ group_id: 'g1', user_id: 'u1', role: GroupMemberRole.OWNER } as GroupMember);
    });

    it('returns group detail for a member', async () => {
      const req = fakeReq({ params: { groupId: 'g1' } });
      const res = fakeRes();

      await getGroup(req, res);

      expect(res._status).toBe(200);
      expect(res._body.id).toBe('g1');
      expect(res._body.members).toBeDefined();
    });

    it('returns 403 for a non-member', async () => {
      const req = fakeReq({ user: { id: 'u2', email: 'b@b.com' }, params: { groupId: 'g1' } });
      const res = fakeRes();

      await getGroup(req, res);

      expect(res._status).toBe(403);
    });

    it('returns 404 for a nonexistent group', async () => {
      const req = fakeReq({ params: { groupId: 'nonexistent' } });
      const res = fakeRes();

      await getGroup(req, res);

      expect(res._status).toBe(404);
    });
  });

  // ─────────────────────────────── ADD MEMBER ───────────────────────────────

  describe('addMember', () => {
    beforeEach(() => {
      groupStore.push({ id: 'g1', name: 'Group One', owner_id: 'u1', created_at: new Date() } as Group);
      memberStore.push({ group_id: 'g1', user_id: 'u1', role: GroupMemberRole.OWNER } as GroupMember);
    });

    it('owner adds a new member', async () => {
      const req = fakeReq({ params: { groupId: 'g1' }, body: { user_id: 'u2' } });
      const res = fakeRes();

      await addMember(req, res);

      expect(res._status).toBe(201);
      expect(res._body.user_id).toBe('u2');
      expect(memberStore.length).toBe(2);
    });

    it('non-owner cannot add members', async () => {
      // u2 is a regular member
      memberStore.push({ group_id: 'g1', user_id: 'u2', role: GroupMemberRole.MEMBER } as GroupMember);

      const req = fakeReq({
        user: { id: 'u2', email: 'b@b.com' },
        params: { groupId: 'g1' },
        body: { user_id: 'u3' },
      });
      const res = fakeRes();

      await addMember(req, res);

      expect(res._status).toBe(403);
      expect(res._body.message).toMatch(/owner/i);
    });

    it('rejects duplicate member', async () => {
      memberStore.push({ group_id: 'g1', user_id: 'u2', role: GroupMemberRole.MEMBER } as GroupMember);

      const req = fakeReq({ params: { groupId: 'g1' }, body: { user_id: 'u2' } });
      const res = fakeRes();

      await addMember(req, res);

      expect(res._status).toBe(409);
    });

    it('rejects when group is full (20 members)', async () => {
      // Fill the group to 20
      for (let i = 0; i < 19; i++) {
        memberStore.push({
          group_id: 'g1',
          user_id: `filler-${i}`,
          role: GroupMemberRole.MEMBER,
        } as GroupMember);
      }
      expect(memberStore.length).toBe(20); // 1 owner + 19 fillers

      const req = fakeReq({ params: { groupId: 'g1' }, body: { user_id: 'u2' } });
      const res = fakeRes();

      await addMember(req, res);

      expect(res._status).toBe(403);
      expect(res._body.message).toMatch(/20/);
    });

    it('rejects if target user is at the 3-group limit', async () => {
      // u2 already in 3 groups
      for (let i = 0; i < 3; i++) {
        memberStore.push({
          group_id: `other-${i}`,
          user_id: 'u2',
          role: GroupMemberRole.MEMBER,
        } as GroupMember);
      }

      const req = fakeReq({ params: { groupId: 'g1' }, body: { user_id: 'u2' } });
      const res = fakeRes();

      await addMember(req, res);

      expect(res._status).toBe(403);
      expect(res._body.message).toMatch(/maximum/i);
    });

    it('returns 404 if target user does not exist', async () => {
      const req = fakeReq({ params: { groupId: 'g1' }, body: { user_id: 'nonexistent-user' } });
      const res = fakeRes();

      await addMember(req, res);

      expect(res._status).toBe(404);
      expect(res._body.message).toMatch(/User not found/i);
    });
  });

  // ─────────────────────────────── REMOVE MEMBER ────────────────────────────

  describe('removeMember', () => {
    beforeEach(() => {
      groupStore.push({ id: 'g1', name: 'Group One', owner_id: 'u1', created_at: new Date() } as Group);
      memberStore.push({ group_id: 'g1', user_id: 'u1', role: GroupMemberRole.OWNER } as GroupMember);
      memberStore.push({ group_id: 'g1', user_id: 'u2', role: GroupMemberRole.MEMBER } as GroupMember);
    });

    it('owner can remove a member', async () => {
      const req = fakeReq({ params: { groupId: 'g1', userId: 'u2' } });
      const res = fakeRes();

      await removeMember(req, res);

      expect(res._status).toBe(200);
      expect(memberStore.find((m) => m.user_id === 'u2')).toBeUndefined();
    });

    it('member can remove themselves (leave)', async () => {
      const req = fakeReq({
        user: { id: 'u2', email: 'b@b.com' },
        params: { groupId: 'g1', userId: 'u2' },
      });
      const res = fakeRes();

      await removeMember(req, res);

      expect(res._status).toBe(200);
    });

    it('cannot remove the group owner', async () => {
      // Even the owner trying to remove themselves should fail
      const req = fakeReq({ params: { groupId: 'g1', userId: 'u1' } });
      const res = fakeRes();

      await removeMember(req, res);

      expect(res._status).toBe(403);
      expect(res._body.message).toMatch(/owner/i);
    });

    it('non-owner cannot remove someone else', async () => {
      memberStore.push({ group_id: 'g1', user_id: 'u3', role: GroupMemberRole.MEMBER } as GroupMember);

      const req = fakeReq({
        user: { id: 'u2', email: 'b@b.com' },
        params: { groupId: 'g1', userId: 'u3' },
      });
      const res = fakeRes();

      await removeMember(req, res);

      expect(res._status).toBe(403);
    });

    it('returns 404 for nonexistent group', async () => {
      const req = fakeReq({ params: { groupId: 'nonexistent', userId: 'u2' } });
      const res = fakeRes();

      await removeMember(req, res);

      expect(res._status).toBe(404);
    });
  });
});
