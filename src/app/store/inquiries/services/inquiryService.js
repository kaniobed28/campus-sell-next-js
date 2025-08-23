/**
 * Inquiry Service for Store Management
 * Handles all inquiry and communication functionality
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  runTransaction
} from 'firebase/firestore';

import {
  createInquiryModel,
  createMessageModel,
  INQUIRY_STATUS,
  ACTIVITY_TYPES
} from '@/types/store';

class InquiryService {
  constructor() {
    this.collections = {
      inquiries: 'inquiries',
      messages: 'messages',
      products: 'products',
      notifications: 'notifications'
    };
  }

  /**
   * Get all inquiries for a seller
   */
  async getSellerInquiries(sellerId, options = {}) {
    try {
      const {
        status = null,
        priority = null,
        sortBy = 'lastMessageAt',
        sortOrder = 'desc',
        limitCount = 50
      } = options;

      let q = query(
        collection(db, this.collections.inquiries),
        where('sellerId', '==', sellerId)
      );

      // Apply filters
      if (status) {
        q = query(q, where('status', '==', status));
      }
      if (priority) {
        q = query(q, where('priority', '==', priority));
      }

      // Apply sorting
      q = query(q, orderBy(sortBy, sortOrder));

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const inquiries = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const inquiryData = { id: doc.id, ...doc.data() };
          
          // Get product information
          if (inquiryData.productId) {
            try {
              const productDoc = await getDoc(doc(db, this.collections.products, inquiryData.productId));
              if (productDoc.exists()) {
                inquiryData.productTitle = productDoc.data().title;
                inquiryData.productPrice = productDoc.data().price;
                inquiryData.productImageUrl = productDoc.data().imageUrls?.[0];
              }
            } catch (error) {
              console.warn('Error fetching product data for inquiry:', error);
            }
          }

          return createInquiryModel(inquiryData);
        })
      );

      return inquiries;
    } catch (error) {
      console.error('Error fetching seller inquiries:', error);
      throw new Error('Failed to fetch inquiries');
    }
  }

  /**
   * Get a specific inquiry with all messages
   */
  async getInquiry(inquiryId, sellerId) {
    try {
      const inquiryRef = doc(db, this.collections.inquiries, inquiryId);
      const inquiryDoc = await getDoc(inquiryRef);

      if (!inquiryDoc.exists()) {
        throw new Error('Inquiry not found');
      }

      const inquiryData = inquiryDoc.data();
      
      // Verify seller ownership
      if (inquiryData.sellerId !== sellerId) {
        throw new Error('Unauthorized: You can only view your own inquiries');
      }

      // Get product information
      if (inquiryData.productId) {
        try {
          const productDoc = await getDoc(doc(db, this.collections.products, inquiryData.productId));
          if (productDoc.exists()) {
            inquiryData.productTitle = productDoc.data().title;
            inquiryData.productPrice = productDoc.data().price;
            inquiryData.productImageUrl = productDoc.data().imageUrls?.[0];
          }
        } catch (error) {
          console.warn('Error fetching product data:', error);
        }
      }

      return createInquiryModel({ id: inquiryDoc.id, ...inquiryData });
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      throw error;
    }
  }

  /**
   * Send a message in an inquiry
   */
  async sendMessage(inquiryId, senderId, content, senderType = 'seller') {
    try {
      return await runTransaction(db, async (transaction) => {
        const inquiryRef = doc(db, this.collections.inquiries, inquiryId);
        const inquiryDoc = await transaction.get(inquiryRef);

        if (!inquiryDoc.exists()) {
          throw new Error('Inquiry not found');
        }

        const inquiryData = inquiryDoc.data();

        // Verify permissions
        if (senderType === 'seller' && inquiryData.sellerId !== senderId) {
          throw new Error('Unauthorized: You can only reply to your own inquiries');
        }
        if (senderType === 'buyer' && inquiryData.buyerId !== senderId) {
          throw new Error('Unauthorized: You can only send messages to your own inquiries');
        }

        // Create new message
        const newMessage = createMessageModel({
          inquiryId,
          senderId,
          senderType,
          content: content.trim(),
          timestamp: serverTimestamp(),
          isRead: false,
          isAutoResponse: false
        });

        // Update inquiry with new message
        const updatedMessages = [...(inquiryData.messages || []), newMessage];
        const newStatus = senderType === 'seller' ? INQUIRY_STATUS.REPLIED : INQUIRY_STATUS.OPEN;

        transaction.update(inquiryRef, {
          messages: updatedMessages,
          status: newStatus,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Mark previous messages as read if this is from the seller
        if (senderType === 'seller') {
          const readMessages = updatedMessages.map(msg => ({
            ...msg,
            isRead: msg.senderType === 'buyer' ? true : msg.isRead
          }));
          
          transaction.update(inquiryRef, {
            messages: readMessages
          });
        }

        // Send notification to the other party
        await this.sendNotification(
          senderType === 'seller' ? inquiryData.buyerId : inquiryData.sellerId,
          'new_message',
          {
            inquiryId,
            senderName: senderType === 'seller' ? 'Seller' : 'Buyer',
            productTitle: inquiryData.productTitle || 'Product',
            messagePreview: content.substring(0, 100)
          }
        );

        return { success: true, messageId: newMessage.id };
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Update inquiry status
   */
  async updateInquiryStatus(inquiryId, newStatus, sellerId) {
    try {
      const inquiryRef = doc(db, this.collections.inquiries, inquiryId);
      const inquiryDoc = await getDoc(inquiryRef);

      if (!inquiryDoc.exists()) {
        throw new Error('Inquiry not found');
      }

      const inquiryData = inquiryDoc.data();
      
      // Verify seller ownership
      if (inquiryData.sellerId !== sellerId) {
        throw new Error('Unauthorized: You can only update your own inquiries');
      }

      const oldStatus = inquiryData.status;

      // Update inquiry status
      await updateDoc(inquiryRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === INQUIRY_STATUS.COMPLETED && { resolvedAt: serverTimestamp() })
      });

      // Add system message for status change
      if (oldStatus !== newStatus) {
        const systemMessage = createMessageModel({
          inquiryId,
          senderId: 'system',
          senderType: 'system',
          content: `Status changed from ${oldStatus} to ${newStatus}`,
          timestamp: serverTimestamp(),
          isRead: true,
          isSystemMessage: true
        });

        await updateDoc(inquiryRef, {
          messages: arrayUnion(systemMessage)
        });
      }

      return { success: true, oldStatus, newStatus };
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw error;
    }
  }

  /**
   * Mark inquiry as complete
   */
  async markInquiryComplete(inquiryId, sellerId, resolutionType = 'resolved') {
    try {
      return await this.updateInquiryStatus(inquiryId, INQUIRY_STATUS.COMPLETED, sellerId);
    } catch (error) {
      console.error('Error marking inquiry as complete:', error);
      throw error;
    }
  }

  /**
   * Create a new inquiry (typically called by buyers)
   */
  async createInquiry(productId, buyerId, subject, initialMessage, priority = 'normal') {
    try {
      // Get product information
      const productDoc = await getDoc(doc(db, this.collections.products, productId));
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      const productData = productDoc.data();
      const sellerId = productData.createdBy;

      // Create initial message
      const initialMsg = createMessageModel({
        senderId: buyerId,
        senderType: 'buyer',
        content: initialMessage.trim(),
        timestamp: serverTimestamp(),
        isRead: false
      });

      // Create inquiry
      const inquiryData = createInquiryModel({
        productId,
        buyerId,
        sellerId,
        subject: subject.trim(),
        status: INQUIRY_STATUS.OPEN,
        priority,
        messages: [initialMsg],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp()
      });

      // Save to database
      const inquiryRef = await addDoc(collection(db, this.collections.inquiries), inquiryData);

      // Send notification to seller
      await this.sendNotification(sellerId, 'new_inquiry', {
        inquiryId: inquiryRef.id,
        productTitle: productData.title,
        buyerMessage: initialMessage.substring(0, 100)
      });

      // Update product inquiry count
      await updateDoc(doc(db, this.collections.products, productId), {
        inquiryCount: (productData.inquiryCount || 0) + 1
      });

      return { success: true, inquiryId: inquiryRef.id };
    } catch (error) {
      console.error('Error creating inquiry:', error);
      throw error;
    }
  }

  /**
   * Send notification to user
   */
  async sendNotification(userId, type, data) {
    try {
      // In a real implementation, this would integrate with your notification system
      // For now, we'll just log it
      console.log('Sending notification:', { userId, type, data });
      
      // You could implement email notifications, push notifications, etc. here
      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't throw error as this is a background operation
    }
  }

  /**
   * Get inquiry statistics for a seller
   */
  async getInquiryStats(sellerId) {
    try {
      const inquiries = await this.getSellerInquiries(sellerId);
      
      const stats = {
        total: inquiries.length,
        open: inquiries.filter(i => i.status === INQUIRY_STATUS.OPEN).length,
        replied: inquiries.filter(i => i.status === INQUIRY_STATUS.REPLIED).length,
        completed: inquiries.filter(i => i.status === INQUIRY_STATUS.COMPLETED).length,
        closed: inquiries.filter(i => i.status === INQUIRY_STATUS.CLOSED).length,
        
        // Priority distribution
        urgent: inquiries.filter(i => i.priority === 'urgent').length,
        high: inquiries.filter(i => i.priority === 'high').length,
        normal: inquiries.filter(i => i.priority === 'normal').length,
        low: inquiries.filter(i => i.priority === 'low').length,
        
        // Response metrics
        totalMessages: inquiries.reduce((sum, i) => sum + (i.messages?.length || 0), 0),
        unreadMessages: inquiries.reduce((sum, i) => {
          return sum + (i.messages?.filter(m => !m.isRead && m.senderType === 'buyer').length || 0);
        }, 0)
      };

      // Calculate rates
      stats.responseRate = stats.total > 0 ? Math.round(((stats.replied + stats.completed) / stats.total) * 100) : 0;
      stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      stats.averageMessagesPerInquiry = stats.total > 0 ? Math.round(stats.totalMessages / stats.total) : 0;

      return stats;
    } catch (error) {
      console.error('Error calculating inquiry stats:', error);
      throw new Error('Failed to calculate inquiry statistics');
    }
  }

  /**
   * Search inquiries
   */
  async searchInquiries(sellerId, searchTerm, options = {}) {
    try {
      // Get all inquiries first (in a real implementation, you'd use full-text search)
      const allInquiries = await this.getSellerInquiries(sellerId, options);
      
      if (!searchTerm.trim()) {
        return allInquiries;
      }

      const searchLower = searchTerm.toLowerCase();
      
      return allInquiries.filter(inquiry => 
        inquiry.subject?.toLowerCase().includes(searchLower) ||
        inquiry.productTitle?.toLowerCase().includes(searchLower) ||
        inquiry.messages?.some(msg => msg.content?.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching inquiries:', error);
      throw new Error('Failed to search inquiries');
    }
  }

  /**
   * Generate mock inquiries for testing
   */
  generateMockInquiries(sellerId, count = 5) {
    const mockInquiries = [];
    const subjects = [
      "Question about this item",
      "Is this still available?",
      "Can we meet on campus?",
      "What's the condition?",
      "Price negotiable?",
      "More photos please",
      "When can I pick it up?",
      "Does it come with accessories?"
    ];

    const messages = [
      "Hi! I'm interested in this item. Is it still available?",
      "Could you tell me more about the condition?",
      "Would you be willing to negotiate on the price?",
      "Can we meet somewhere on campus?",
      "Do you have any more photos?",
      "What's the best way to contact you?",
      "Is there anything wrong with it?",
      "How long have you had this?"
    ];

    const priorities = ['normal', 'normal', 'normal', 'high', 'low'];
    const statuses = [INQUIRY_STATUS.OPEN, INQUIRY_STATUS.REPLIED, INQUIRY_STATUS.COMPLETED];

    for (let i = 0; i < count; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const lastMessageAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000); // Up to 24 hours later

      const inquiry = createInquiryModel({
        id: `mock_inquiry_${i}`,
        productId: `mock_product_${i}`,
        buyerId: `mock_buyer_${i}`,
        sellerId: sellerId,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        productTitle: `Mock Product ${i + 1}`,
        productPrice: Math.floor(Math.random() * 500) + 50,
        messages: [
          createMessageModel({
            id: `mock_msg_${i}_1`,
            senderId: `mock_buyer_${i}`,
            senderType: 'buyer',
            content: messages[Math.floor(Math.random() * messages.length)],
            timestamp: createdAt,
            isRead: Math.random() > 0.3 // 70% chance of being read
          })
        ],
        createdAt,
        lastMessageAt,
        updatedAt: lastMessageAt
      });

      // Add seller reply for some inquiries
      if (Math.random() > 0.4) { // 60% chance of seller reply
        inquiry.messages.push(
          createMessageModel({
            id: `mock_msg_${i}_2`,
            senderId: sellerId,
            senderType: 'seller',
            content: "Thanks for your interest! Yes, it's still available. Let me know if you have any other questions.",
            timestamp: new Date(createdAt.getTime() + Math.random() * 12 * 60 * 60 * 1000),
            isRead: true
          })
        );
      }

      mockInquiries.push(inquiry);
    }

    return mockInquiries;
  }
}

// Create and export singleton instance
const inquiryService = new InquiryService();
export default inquiryService;