const bcryptjs = require('bcryptjs');
const db = require('../database/models');


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
    const searchQuery = req.query.search
    db.Book.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          db.Sequelize.where(
            db.Sequelize.fn( db.Sequelize.col("Book.title")),
            "LIKE",
            `%${searchQuery()}%`
          ),
        ],
      },
    })
    .then((books) => {
      res.render("/books/search", { search: books });
    })
    .catch(error =>{console.log(error)})
},

  deleteBook: (req, res) => {
    db.Book.destroy({where:{id:req.params.Book}})
    .then(res.render('home'))
    .catch((error) => console.log(error))
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
  edit: (req, res) => {
    // Implement edit book
    res.render('editBook', {id: req.params.id})
  },
  processEdit: (req, res) => {
    db.Book.update({title:req.body.title,
    description:req.body.description,
  cover:req.body.cover,
author:req.params.author},
{
  where:{id:req.params.id}
})
.then()
    res.render('home');
  }
};

module.exports = mainController;
