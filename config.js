/*
 * HY320 Galaxy — shop configuration.
 * Edit prices, contacts and delivery tariffs here; app.js reads everything from this object.
 */
window.SHOP = {
  PRODUCT: 'Mini Projecteur LED Intelligent Portable HY320 Galaxy',
  PRODUCT_PRICE: 20000,
  HOME_DELIVERY_SURCHARGE: 350, // Livraison à domicile = Stop Desk + 350 DA (charged once per order)
  MAX_QTY: 10,

  WHATSAPP: '213556011290',
  FORMSUBMIT_ENDPOINT: 'https://formsubmit.co/ajax/dazaiosa2000@gmail.com',

  // Hero headline. Options: 'Transformez votre espace en mini cinéma.',
  // 'Votre mini cinéma, partout où vous allez.', 'Le cinéma commence chez vous.'
  HERO_HEADLINE: 'Transformez votre espace en mini cinéma.',
  STICKY_CTA: true, // sticky "COMMANDER — 20 000 DA" bar on mobile

  // Stop Desk tariffs (DA). A wilaya missing from this table shows "À confirmer"
  // and is routed to WhatsApp instead of the normal checkout.
  deliveryRates: {
    'Sétif': 400,
    'Alger': 450, 'Chlef': 450, 'Blida': 450, 'Bouira': 450, 'Tizi Ouzou': 450, 'Constantine': 450,
    'Médéa': 450, 'Oran': 450, 'Bordj Bou Arréridj': 450, 'Boumerdès': 450, 'Tipaza': 450, 'Aïn Defla': 450,
    'Oum El Bouaghi': 500, 'Batna': 500, 'Béjaïa': 500, 'Tlemcen': 500, 'Tiaret': 500, 'Jijel': 500,
    'Skikda': 500, 'Sidi Bel Abbès': 500, 'Annaba': 500, 'Mostaganem': 500, "M'Sila": 500,
    'Tissemsilt': 500, 'Mila': 500, 'Relizane': 500,
    'Djelfa': 600, 'Saïda': 600, 'Guelma': 600, 'Mascara': 600, 'Khenchela': 600, 'Souk Ahras': 600,
    'Biskra': 600, 'Tébessa': 600, 'El Tarf': 600,
    'Laghouat': 700, 'Ouled Djellal': 700,
    'Ouargla': 800, 'El Bayadh': 800, 'El Oued': 800, 'Naâma': 800, 'Ghardaïa': 800, 'Touggourt': 800,
    "El M'Ghair": 800,
    'El Meniaa': 1000,
    'Adrar': 1100, 'Béchar': 1100, 'Timimoun': 1100, 'Béni Abbès': 1100, 'In Salah': 1100,
    'Tamanrasset': 1400, 'Tindouf': 1400,
    'Illizi': 1700, 'Bordj Badji Mokhtar': 1700, 'In Guezzam': 1700, 'Djanet': 1700
  },

  // All 69 wilayas, in official number order (index + 1 = code).
  // NOTE: 59–69 are the newest wilayas; verify names/numbers against the official list.
  WILAYAS: [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
    'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
    'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla',
    'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
    'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
    'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa', 'Aflou', 'Barika',
    'El Kantara', 'Bir El Ater', 'El Abiodh Sidi Cheikh', 'El Aricha', 'Ksar Chellala', 'Messaad', 'Aïn Oussara', 'Bou Saâda', 'Ksar El Boukhari'
  ]
};
