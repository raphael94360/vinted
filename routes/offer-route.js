const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middlewares/isAuthenticated");
const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/offer/publish", isAuthenticated, async (req, res) => {

  // res.json(req.user);
  // console.log(req.fields);
  // console.log(req.files.picture.path);

  try {
    const { title, description, price, condition, city, brand, size, color } = req.fields;

    // Créer une annonce
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ETAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });
    console.log(newOffer);

    // Envoi de l'image à Cloudinary

      const result = await cloudinary.uploader.upload(req.files.picture.path, { folder: `/vinted/offers/${newOffer._id}`});
      console.log(result);
      newOffer.product_image = result;
      await newOffer.save();
      return res.json({
        _id: newOffer._id,
        product_name: newOffer.product_name,
        product_description: newOffer.product_description,
        product_price: newOffer.product_price,
        product_details: newOffer.product_details,
        owner: {
          account: newOffer.owner.account,
          _id: newOffer.owner._id,
        },
        product_image: newOffer.product_image,
      });

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

})

router.get("/offers", async (req, res) => {
  try {
    const filters = {};
    // Alimenter mon filter en fonction des queries que je reçois
    if (req.query.title) {
      // Ajouter une clef product_name à mon objet qui contiendra un RegExp
      filters.product_name = new RegExp(req.query.title, "i");
    }

    const obj = {
      product_name: /bleu/,
      product_price: { $lte: 100 },
    };

    if (req.query.priceMin) {
      // console.log(typeof req.query.priceMin);
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }

    if (req.query.priceMax) {
      // Si j'ai déjà une clef product_price, alors je rajoute un clef $lte à l'objet contenu dans product_price
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        // Sinon, je rajoute une clef product_price à filters qui contiendra { $lte: Number(req.query.priceMax) }
        filters.product_price = { $lte: Number(req.query.priceMax) };
      }
    }

    const sort = {};

    if (req.query.sort === "price-desc") {
      sort.product_price = "desc";
    } else if (req.query.sort === "price-asc") {
      sort.product_price = "asc";
    }

    let limit = 10;
    if (req.query.limit) {
      limit = req.query.limit;
    }

    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const skip = (page -1) * limit;

    // 10 résultats par page : 1 skip 0, 2 skip 10, 3 skip 20
    //  3 resultats par page : 1 skip 0, 2 skip 3, 3 skip 6

    const results = await Offer.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("owner", "_id account");
    const count = await Offer.countDocuments(filters);

    console.log(results.length);
    return res.json({ count: count, offers: results });
    
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    // console.log(req.params);
    const offer = await Offer.findById(req.params.id)
      .populate("owner", "account")
      .select("product_image.secure_url product_name product_price");
    return res.json(offer);  
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;