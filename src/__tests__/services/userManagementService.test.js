// __tests__/services/userManagementService.test.js
import { userManagementService } from '@/services/userManagementService';
import { USER_STATUS } from '@/types/admin';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
}));

describe('UserManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should retrieve all users with default parameters', async () => {
      const mockUsers = [
        {
          id: 'user1',
          data: () => ({
            email: 'user1@example.com',
            displayName: 'User One',
            status: USER_STATUS.ACTIVE,
            registrationDate: { toDate: () => new Date('2024-01-01') }
          })
        }
      ];

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockUsers });

      const result = await userManagementService.getAllUsers();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        uid: 'user1',
        email: 'user1@example.com',
        displayName: 'User One',
        status: USER_STATUS.ACTIVE
      });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        status: USER_STATUS.SUSPENDED,
        email: 'test@example.com',
        limit: 10
      };

      const { getDocs, query, where, orderBy, limit } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });

      await userManagementService.getAllUsers(filters);

      expect(where).toHaveBeenCalledWith('status', '==', USER_STATUS.SUSPENDED);
      expect(limit).toHaveBeenCalledWith(10);
    });
  });

  describe('getUserDetails', () => {
    it('should retrieve user details by UID', async () => {
      const mockUser = {
        id: 'user1',
        exists: () => true,
        data: () => ({
          email: 'user1@example.com',
          displayName: 'User One',
          status: USER_STATUS.ACTIVE,
          registrationDate: { toDate: () => new Date('2024-01-01') }
        })
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue(mockUser);

      const result = await userManagementService.getUserDetails('user1');

      expect(result).toMatchObject({
        uid: 'user1',
        email: 'user1@example.com',
        displayName: 'User One',
        status: USER_STATUS.ACTIVE
      });
    });

    it('should return null for non-existent user', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({ exists: () => false });

      const result = await userManagementService.getUserDetails('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('suspendUser', () => {
    it('should suspend user successfully', async () => {
      const { getDoc, updateDoc } = require('firebase/firestore');
      
      // Mock user exists
      getDoc.mockResolvedValueOnce({ exists: () => true });
      
      // Mock updated user data
      getDoc.mockResolvedValueOnce({
        id: 'user1',
        exists: () => true,
        data: () => ({
          email: 'user1@example.com',
          status: USER_STATUS.SUSPENDED,
          suspensionReason: 'Violation of terms',
          suspendedBy: 'admin@example.com'
        })
      });

      updateDoc.mockResolvedValue();

      const result = await userManagementService.suspendUser(
        'user1', 
        'Violation of terms', 
        'admin@example.com'
      );

      expect(updateDoc).toHaveBeenCalled();
      expect(result.status).toBe(USER_STATUS.SUSPENDED);
      expect(result.suspensionReason).toBe('Violation of terms');
    });

    it('should throw error for non-existent user', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({ exists: () => false });

      await expect(
        userManagementService.suspendUser('nonexistent', 'reason', 'admin')
      ).rejects.toThrow('User not found');
    });
  });

  describe('activateUser', () => {
    it('should activate suspended user successfully', async () => {
      const { getDoc, updateDoc } = require('firebase/firestore');
      
      // Mock user exists
      getDoc.mockResolvedValueOnce({ exists: () => true });
      
      // Mock updated user data
      getDoc.mockResolvedValueOnce({
        id: 'user1',
        exists: () => true,
        data: () => ({
          email: 'user1@example.com',
          status: USER_STATUS.ACTIVE,
          suspensionReason: null,
          activatedBy: 'admin@example.com'
        })
      });

      updateDoc.mockResolvedValue();

      const result = await userManagementService.activateUser('user1', 'admin@example.com');

      expect(updateDoc).toHaveBeenCalled();
      expect(result.status).toBe(USER_STATUS.ACTIVE);
      expect(result.suspensionReason).toBeNull();
    });
  });

  describe('banUser', () => {
    it('should ban user successfully', async () => {
      const { getDoc, updateDoc } = require('firebase/firestore');
      
      // Mock user exists
      getDoc.mockResolvedValueOnce({ exists: () => true });
      
      // Mock updated user data
      getDoc.mockResolvedValueOnce({
        id: 'user1',
        exists: () => true,
        data: () => ({
          email: 'user1@example.com',
          status: USER_STATUS.BANNED,
          banReason: 'Severe violation',
          bannedBy: 'admin@example.com'
        })
      });

      updateDoc.mockResolvedValue();

      const result = await userManagementService.banUser(
        'user1', 
        'Severe violation', 
        'admin@example.com'
      );

      expect(updateDoc).toHaveBeenCalled();
      expect(result.status).toBe(USER_STATUS.BANNED);
      expect(result.banReason).toBe('Severe violation');
    });
  });

  describe('searchUsers', () => {
    it('should return empty array for short search terms', async () => {
      const result = await userManagementService.searchUsers('a');
      expect(result).toEqual([]);
    });

    it('should search users by email and name', async () => {
      const mockUsers = [
        {
          id: 'user1',
          data: () => ({
            email: 'test@example.com',
            displayName: 'Test User'
          })
        }
      ];

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockUsers });

      const result = await userManagementService.searchUsers('test');

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('test@example.com');
    });
  });

  describe('bulkUpdateUserStatus', () => {
    it('should update multiple users successfully', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue();

      const userIds = ['user1', 'user2', 'user3'];
      const result = await userManagementService.bulkUpdateUserStatus(
        userIds,
        USER_STATUS.SUSPENDED,
        'Bulk suspension',
        'admin@example.com'
      );

      expect(updateDoc).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(3);
    });
  });
});