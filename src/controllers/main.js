const bcryptjs = require('bcryptjs');
const db = require('../database/models');
const {Op} = require('sequelize')
const { validationResult } = require('express-validator');

const mainController = {
  home: (req, res) => {
    db.Book.findAll({
      include: [{ association: 'authors' }]
    })
      .then((books) => {
        res.render('home', { books });
      })
      .catch((error) => console.log(error));
  },
  bookDetail: (req, res) => {
    db.Book.findByPk(req.params.id, {
      include: [{ association: 'authors' }]
    })
      .then((book) => {
        res.render('bookDetail', { book });
      })
      .catch((error) => console.log(error));
  },
  bookSearch: (req, res) => {
    res.render('search', { books: [] });
  },
  bookSearchResult: (req, res) => {
    const { title } = req.body;
    console.log(title);
  
    db.Book.findAll({
      include: ['authors'],
      where: {
        title: { [Op.substring]: title }
      }
    })
      .then(books => {
        if (books.length === 0) {
          res.render('noResults');
        } else {
          res.render('search', { books });
        }
      })
      .catch(error => {
        console.log(error);
      });
  },

  deleteBook: (req, res) => {
    db.BooksAuthors.destroy({
      where : {
        BookId : req.params.id
      }
    }).then((response) => {
      if (response){
        db.Book.destroy({
          where : {
            id: req.params.id
          },
          force : true
          
        }).then(() => res.redirect('/'))
      }
   
    }).catch(error => console.log(error))

  },
  authors: (req, res) => {
    db.Author.findAll()
      .then((authors) => {
        res.render('authors', { authors });
      })
      .catch((error) => console.log(error));
  },
  authorBooks: (req, res) => {
    db.Book.findByPk(req.params.id,{
      include: [{ association: 'authors' }]
    })
    .then((book)=>{
      res.render('authorBooks',{ book } );
    })
    .catch((error)=>console.log(error))
    
  },
  register: (req, res) => {
    res.render('register');
  },
  processRegister: (req, res) => {
    db.User.create({
      Name: req.body.name,
      Email: req.body.email,
      Country: req.body.country,
      Pass: bcryptjs.hashSync(req.body.password, 10),
      CategoryId: req.body.category
    })
      .then(() => {
        res.redirect('/');
      })
      .catch((error) => console.log(error));
  },
  login: (req, res) => {
    res.render('login');
  },
  processLogin: (req, res) => {   
   db.User.findOne({
    where: {
        Email: req.body.Email
    }
}).then((userToLogin) => {
    if (userToLogin) {
        const isOkPassword = bcryptjs.compareSync(req.body.Pass, userToLogin.Pass);
        if (isOkPassword) {
            delete userToLogin.Pass;
            req.session.userLogged = userToLogin;
            return res.redirect('/home');
        }
    }
    return res.render('./users/login', {
        errors: {
            mail: {
                msg: 'Las credenciales no son válidas'
            }
        }
    });
});
  },
  edit: async (req, res) => {
    let bookToEdit= await db.Book.findByPk (req.params.id,{
      include: [{association:'authors'}],
      raw: true,
      nest: true      
      })
    if(bookToEdit){
      res.render('editBook', {book:bookToEdit})
    }else{
      res.send('El libro no fue encontrado.');
    }  
    },
    processEdit: async (req, res) => {  let bookToEditP = await db.Book.findByPk(req.params.id, {
        include: [{association: "authors"}]
    })
    let books = db.Book.findAll({
      include: [{ association: 'authors' }]
    })
    if(bookToEditP){
      db.Book.update({
        title: req.body.title,
        description: req.body.description,
        cover: req.body.cover,
        }, {where: {id: req.params.id}})  
        return  res.redirect('/');   
    }else {
    res.send('no se encontró el libro')
    } 
    }
  };

module.exports = mainController;
