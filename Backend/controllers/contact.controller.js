import Contact from '../models/Contact.js';

// Submit contact form (public)
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email'
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters'
      });
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: contact
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get all contact messages (admin only)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Get single contact message (admin only)
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Mark as read if it was pending
    if (contact.status === 'pending') {
      contact.status = 'read';
      await contact.save();
    }
    
    res.status(200).json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message',
      error: error.message
    });
  }
};

// Reply to contact message (admin only)
export const replyToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    
    if (!reply || !reply.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }
    
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    contact.reply = reply;
    contact.status = 'replied';
    contact.repliedAt = new Date();
    await contact.save();
    
    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      contact
    });
  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reply',
      error: error.message
    });
  }
};

// Delete contact message (admin only)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await Contact.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// Get contact statistics (admin only)
export const getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const pending = await Contact.countDocuments({ status: 'pending' });
    const read = await Contact.countDocuments({ status: 'read' });
    const replied = await Contact.countDocuments({ status: 'replied' });
    
    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        read,
        replied
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};