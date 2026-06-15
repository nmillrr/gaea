import { Request, Response } from 'express';
import { AppDataSource } from '../db/init';
import { Group } from '../entities/Group';
import { GroupMember, GroupMemberRole } from '../entities/GroupMember';
import { User } from '../entities/User';
import { In } from 'typeorm';

const groupRepository = AppDataSource.getRepository(Group);
const memberRepository = AppDataSource.getRepository(GroupMember);
const userRepository = AppDataSource.getRepository(User);

/** MVP limit from PRD §8 — "Group creation (up to 20 members in MVP)." */
const MAX_GROUP_MEMBERS = 20;
/** Free-tier limit from PRD §14 — "Up to 3 friend groups." */
const MAX_GROUPS_PER_USER = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a user is a member of a group.
 */
export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const member = await memberRepository.findOne({
    where: { group_id: groupId, user_id: userId },
  });
  return !!member;
}

/**
 * Return the number of groups a user currently belongs to.
 */
async function countUserGroups(userId: string): Promise<number> {
  return memberRepository.count({ where: { user_id: userId } });
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /groups
 * Create a new group. The creator becomes the owner and first member.
 * Body: { name: string }
 */
export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Group name is required' });
      return;
    }

    const trimmedName = name.trim().slice(0, 60);

    // Enforce free-tier group limit
    const userGroupCount = await countUserGroups(userId);
    if (userGroupCount >= MAX_GROUPS_PER_USER) {
      res.status(403).json({
        message: `You can be in a maximum of ${MAX_GROUPS_PER_USER} groups`,
      });
      return;
    }

    // Create group
    const group = new Group();
    group.name = trimmedName;
    group.owner_id = userId;
    const savedGroup = await groupRepository.save(group);

    // Add creator as owner member
    const membership = new GroupMember();
    membership.group_id = savedGroup.id;
    membership.user_id = userId;
    membership.role = GroupMemberRole.OWNER;
    await memberRepository.save(membership);

    res.status(201).json({
      id: savedGroup.id,
      name: savedGroup.name,
      owner_id: savedGroup.owner_id,
      created_at: savedGroup.created_at,
      member_count: 1,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

/**
 * GET /groups
 * List all groups the authenticated user belongs to.
 */
export const listMyGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userId = req.user.id;

    // Find all group_ids the user belongs to
    const memberships = await memberRepository.find({
      where: { user_id: userId },
    });

    if (memberships.length === 0) {
      res.json([]);
      return;
    }

    const groupIds = memberships.map((m) => m.group_id);

    // Fetch group details + counts
    const groups = await groupRepository.find({
      where: { id: In(groupIds) },
      order: { created_at: 'DESC' },
    });

    // Compute member counts in a single query
    const counts: Array<{ group_id: string; count: string }> = await memberRepository
      .createQueryBuilder('gm')
      .select('gm.group_id', 'group_id')
      .addSelect('COUNT(*)', 'count')
      .where('gm.group_id IN (:...ids)', { ids: groupIds })
      .groupBy('gm.group_id')
      .getRawMany();

    const countMap = new Map(counts.map((c) => [c.group_id, parseInt(c.count, 10)]));

    const result = groups.map((g) => ({
      id: g.id,
      name: g.name,
      owner_id: g.owner_id,
      created_at: g.created_at,
      member_count: countMap.get(g.id) || 0,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error listing groups:', error);
    res.status(500).json({ message: 'Failed to list groups' });
  }
};

/**
 * GET /groups/:groupId
 * Get group detail + member list. Only accessible by members.
 */
export const getGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const { groupId } = req.params;

    const group = await groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Membership check
    const isMember = await isGroupMember(groupId, userId);
    if (!isMember) {
      res.status(403).json({ message: 'You must be a member of this group' });
      return;
    }

    // Fetch members with user info
    const members = await memberRepository
      .createQueryBuilder('gm')
      .innerJoin(User, 'u', 'gm.user_id = u.id')
      .select([
        'gm.user_id AS user_id',
        'gm.role AS role',
        'gm.joined_at AS joined_at',
        'u.username AS username',
        'u.avatar_url AS avatar_url',
      ])
      .where('gm.group_id = :groupId', { groupId })
      .getRawMany();

    res.json({
      id: group.id,
      name: group.name,
      owner_id: group.owner_id,
      created_at: group.created_at,
      members,
    });
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({ message: 'Failed to get group' });
  }
};

/**
 * POST /groups/:groupId/members
 * Add a user to a group. Only the group owner can invite.
 * Body: { user_id: string }
 */
export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const { groupId } = req.params;
    const { user_id: targetUserId } = req.body;

    if (!targetUserId || typeof targetUserId !== 'string') {
      res.status(400).json({ message: 'user_id is required' });
      return;
    }

    const group = await groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Only the owner can add members
    if (group.owner_id !== userId) {
      res.status(403).json({ message: 'Only the group owner can add members' });
      return;
    }

    // Check target user exists
    const targetUser = await userRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Already a member?
    const existing = await memberRepository.findOne({
      where: { group_id: groupId, user_id: targetUserId },
    });
    if (existing) {
      res.status(409).json({ message: 'User is already a member of this group' });
      return;
    }

    // Cap at 20 members
    const currentCount = await memberRepository.count({ where: { group_id: groupId } });
    if (currentCount >= MAX_GROUP_MEMBERS) {
      res.status(403).json({
        message: `Group cannot exceed ${MAX_GROUP_MEMBERS} members`,
      });
      return;
    }

    // Check if the target user hasn't hit their group limit
    const targetGroupCount = await countUserGroups(targetUserId);
    if (targetGroupCount >= MAX_GROUPS_PER_USER) {
      res.status(403).json({
        message: `User is already in the maximum number of groups (${MAX_GROUPS_PER_USER})`,
      });
      return;
    }

    // Add membership
    const membership = new GroupMember();
    membership.group_id = groupId;
    membership.user_id = targetUserId;
    membership.role = GroupMemberRole.MEMBER;
    await memberRepository.save(membership);

    res.status(201).json({
      group_id: groupId,
      user_id: targetUserId,
      role: GroupMemberRole.MEMBER,
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Failed to add member' });
  }
};

/**
 * DELETE /groups/:groupId/members/:userId
 * Remove a member from a group. Owner can remove anyone; a member can remove
 * themselves (leave). The owner cannot be removed.
 */
export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const currentUserId = req.user.id;
    const { groupId, userId: targetUserId } = req.params;

    const group = await groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Cannot remove the owner
    if (targetUserId === group.owner_id) {
      res.status(403).json({ message: 'Cannot remove the group owner' });
      return;
    }

    // Only the owner or the user themselves can remove a member
    const isOwner = group.owner_id === currentUserId;
    const isSelf = currentUserId === targetUserId;
    if (!isOwner && !isSelf) {
      res.status(403).json({ message: 'Only the group owner or the member themselves can remove a member' });
      return;
    }

    const membership = await memberRepository.findOne({
      where: { group_id: groupId, user_id: targetUserId },
    });
    if (!membership) {
      res.status(404).json({ message: 'Member not found in group' });
      return;
    }

    await memberRepository.remove(membership);
    res.json({ message: 'Member removed' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
};
