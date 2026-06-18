const Resale = require('../models/Resale.model');
const User = require('../models/User.model');
const ContactRequest = require('../models/ContactRequest.model');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { logAction } = require('../utils/logger');

// @desc    Crea nuovo annuncio di biglietto in rivendita
// @route   POST /api/resales
// @access  Private
exports.createResale = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Devi verificare il tuo account per pubblicare annunci. Vai sul profilo e verifica l\'email.'
      });
    }

    // Controllo antispam: max 5 annunci al giorno
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastResaleDate = user.lastResaleDate || new Date(0);

    if (lastResaleDate >= today && user.dailyResaleCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Hai raggiunto il limite massimo di 5 annunci al giorno'
      });
    }

    const { eventName, category: rawCategory, eventDate, eventTime, city, location, originalPrice, askingPrice, quantity, description } = req.body;
    const category = rawCategory?.toLowerCase();

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Devi caricare almeno un\'immagine del biglietto'
      });
    }

    const imageUrls = [];
    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'resales',
          transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
        });
        imageUrls.push(result.secure_url);
        fs.unlink(file.path, () => {});
      } catch (uploadErr) {
        console.error('Errore upload Cloudinary:', uploadErr);
      }
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Errore durante il caricamento delle immagini'
      });
    }

    const resale = await Resale.create({
      seller: req.user._id,
      eventName,
      category,
      eventDate,
      eventTime,
      city,
      location,
      originalPrice,
      askingPrice,
      quantity,
      description,
      images: imageUrls
    });

    // Aggiorna statistiche venditore
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (user.lastResaleDate < todayStart) {
      user.dailyResaleCount = 0;
    }

    user.resalesActive += 1;
    user.dailyResaleCount += 1;
    user.lastResaleDate = new Date();
    await user.save();

    await resale.populate('seller', 'firstName lastName profilePhoto isPhoneVerified rating');

    logAction(req, 'create_resale', 'resale', 'Nuova prevendita creata', { resaleId: resale._id, eventName: resale.eventName });

    res.status(201).json({
      success: true,
      message: 'Annuncio pubblicato con successo',
      data: { resale }
    });
  } catch (error) {
    console.error('Errore creazione resale:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la creazione dell\'annuncio',
      error: error.message
    });
  }
};

// @desc    Ottieni tutti gli annunci (con filtri)
// @route   GET /api/resales
// @access  Public
exports.getResales = async (req, res) => {
  try {
    const { category, city, eventName, minPrice, maxPrice, dateFrom, dateTo, available, page = 1, limit = 10 } = req.query;

    const query = { status: 'active' };

    if (category) {
      query.category = category;
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (eventName) {
      query.eventName = new RegExp(eventName, 'i');
    }

    if (minPrice || maxPrice) {
      query.askingPrice = {};
      if (minPrice) query.askingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.askingPrice.$lte = parseFloat(maxPrice);
    }

    if (dateFrom || dateTo) {
      query.eventDate = {};
      if (dateFrom) query.eventDate.$gte = new Date(dateFrom);
      if (dateTo) query.eventDate.$lte = new Date(dateTo);
    }

    if (available === 'true') {
      query.quantity = { $gt: 0 };
    }

    const resales = await Resale.find(query)
      .populate('seller', 'firstName lastName profilePhoto isPhoneVerified rating')
      .sort({ isFeatured: -1, eventDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Resale.countDocuments(query);

    res.json({
      success: true,
      data: {
        resales,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error('Errore get resales:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli annunci',
      error: error.message
    });
  }
};

// @desc    Ottieni annuncio per ID
// @route   GET /api/resales/:id
// @access  Public
exports.getResaleById = async (req, res) => {
  try {
    const resale = await Resale.findById(req.params.id)
      .populate('seller', 'firstName lastName profilePhoto isPhoneVerified rating totalReviews createdAt phone');

    if (!resale) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato'
      });
    }

    resale.views += 1;
    await resale.save();

    res.json({
      success: true,
      data: { resale }
    });
  } catch (error) {
    console.error('Errore get resale by id:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dell\'annuncio',
      error: error.message
    });
  }
};

// @desc    Aggiorna annuncio
// @route   PUT /api/resales/:id
// @access  Private
exports.updateResale = async (req, res) => {
  try {
    let resale = await Resale.findById(req.params.id);

    if (!resale) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato'
      });
    }

    if (resale.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a modificare questo annuncio'
      });
    }

    if (resale.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Puoi modificare solo annunci attivi'
      });
    }

    const allowedFields = ['eventName', 'category', 'eventDate', 'eventTime', 'city', 'location', 'originalPrice', 'askingPrice', 'quantity', 'description'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'category' ? req.body[field].toLowerCase() : req.body[field];
      }
    });

    let imageUrls = resale.images || [];

    if (req.files && req.files.length > 0) {
      if (req.body.existingImages) {
        const existing = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
        imageUrls = existing.filter(url => typeof url === 'string' && url.startsWith('http'));
      } else {
        imageUrls = [];
      }

      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'resales',
            transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
          });
          imageUrls.push(result.secure_url);
          fs.unlink(file.path, () => {});
        } catch (uploadErr) {
          console.error('Errore upload Cloudinary:', uploadErr);
        }
      }
    }

    updates.images = imageUrls;

    resale = await Resale.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Annuncio aggiornato con successo',
      data: { resale }
    });
  } catch (error) {
    console.error('Errore aggiornamento resale:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento dell\'annuncio',
      error: error.message
    });
  }
};

// @desc    Elimina (cancella) annuncio
// @route   DELETE /api/resales/:id
// @access  Private
exports.deleteResale = async (req, res) => {
  try {
    const resale = await Resale.findById(req.params.id);

    if (!resale) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato'
      });
    }

    if (resale.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a cancellare questo annuncio'
      });
    }

    resale.status = 'cancelled';
    await resale.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { resalesActive: -1 }
    });

    logAction(req, 'delete_resale', 'resale', 'Prevendita eliminata', { resaleId: req.params.id });

    res.json({
      success: true,
      message: 'Annuncio cancellato con successo'
    });
  } catch (error) {
    console.error('Errore cancellazione resale:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la cancellazione dell\'annuncio',
      error: error.message
    });
  }
};

// @desc    Segna annuncio come venduto
// @route   PUT /api/resales/:id/sold
// @access  Private
exports.markAsSold = async (req, res) => {
  try {
    const resale = await Resale.findById(req.params.id);

    if (!resale) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato'
      });
    }

    if (resale.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a modificare questo annuncio'
      });
    }

    resale.status = 'sold';
    await resale.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { resalesActive: -1, resalesSold: 1 }
    });

    logAction(req, 'sell_resale', 'resale', 'Prevendita venduta', { resaleId: req.params.id });

    res.json({
      success: true,
      message: 'Annuncio segnato come venduto'
    });
  } catch (error) {
    console.error('Errore mark as sold:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento',
      error: error.message
    });
  }
};

// @desc    Aggiudica prevendita
// @route   POST /api/resales/:id/claim
// @access  Private
exports.claimResale = async (req, res) => {
  try {
    const resale = await Resale.findById(req.params.id);

    if (!resale) {
      return res.status(404).json({ success: false, message: 'Annuncio non trovato' });
    }

    if (resale.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Non puoi aggiudicare la tua stessa prevendita' });
    }

    if (resale.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Questo annuncio non è più attivo' });
    }

    if (resale.claimedBy) {
      return res.status(400).json({ success: false, message: 'Questa prevendita è già stata aggiudicata da un altro utente' });
    }

    resale.claimedBy = req.user._id;
    resale.claimedAt = new Date();
    await resale.save();

    await resale.populate('claimedBy', 'firstName lastName phone');

    logAction(req, 'claim_resale', 'resale', 'Prevendita aggiudicata', { resaleId: req.params.id });

    res.json({
      success: true,
      message: 'Prevendita aggiudicata! Ora puoi contattare il venditore.',
      data: { claimedBy: resale.claimedBy, claimedAt: resale.claimedAt }
    });
  } catch (error) {
    console.error('Errore claim resale:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiudicazione',
      error: error.message
    });
  }
};

// @desc    Contatta venditore
// @route   POST /api/resales/:id/contact
// @access  Private
exports.contactSeller = async (req, res) => {
  try {
    const resale = await Resale.findById(req.params.id).populate('seller', 'phone firstName lastName');

    if (!resale) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato'
      });
    }

    if (resale.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Non puoi contattare te stesso'
      });
    }

    // Crea o aggiorna richiesta di contatto
    await ContactRequest.findOneAndUpdate(
      { resale: resale._id, buyer: req.user._id },
      { seller: resale.seller._id, contactedAt: new Date() },
      { upsert: true, new: true }
    );

    resale.contactCount += 1;
    await resale.save();

    res.json({
      success: true,
      data: {
        phone: resale.seller.phone,
        sellerName: `${resale.seller.firstName} ${resale.seller.lastName}`
      }
    });
  } catch (error) {
    console.error('Errore contatto venditore:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il contatto',
      error: error.message
    });
  }
};

// @desc    Ottieni i miei annunci
// @route   GET /api/resales/my
// @access  Private
exports.getMyResales = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { seller: req.user._id };

    if (status) {
      query.status = status;
    }

    const resales = await Resale.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { resales }
    });
  } catch (error) {
    console.error('Errore get my resales:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei tuoi annunci',
      error: error.message
    });
  }
};

// @desc    Ottieni le mie richieste di acquisto
// @route   GET /api/resales/my-requests
// @access  Private
exports.getMyBuyRequests = async (req, res) => {
  try {
    const requests = await ContactRequest.find({ buyer: req.user._id })
      .populate({
        path: 'resale',
        populate: {
          path: 'seller',
          select: 'firstName lastName profilePhoto phone rating'
        }
      })
      .populate('seller', 'firstName lastName profilePhoto')
      .sort({ contactedAt: -1 });

    res.json({
      success: true,
      data: { requests }
    });
  } catch (error) {
    console.error('Errore get my buy requests:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle richieste',
      error: error.message
    });
  }
};
