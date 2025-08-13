const jsonServer = require('json-server');
const path = require('path');
const jwt = require('jsonwebtoken'); // npm install jsonwebtoken

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const SECRET_KEY = 'mock-secret-key';
const rewriter = jsonServer.rewriter(
  require(path.join(__dirname, 'routes.json'))
);

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Middleware para proteger rutas (mismo esquema que tu Angular espera)
function verifyToken(req, res, next) {
  // Solo proteger rutas API y endpoints que requieren auth
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/logout') ||
    req.path.startsWith('/check-email') ||
    req.path.startsWith('/register')
  ) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(403).jsonp({ message: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, SECRET_KEY);
      next();
    } catch (err) {
      return res.status(401).jsonp({ message: 'Token inválido o expirado' });
    }
  } else {
    next();
  }
}

// Rewriter
server.use(rewriter);

// ---------------------- ENDPOINTS ----------------------

// Login (devuelve JWT válido)
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    const token = jwt.sign(
      { sub: email, id: user.id },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.jsonp({ user, token });
  } else {
    res.status(401).jsonp({ message: 'Credenciales inválidas' });
  }
});

// CSRF token
server.get('/csrf-token', (req, res) => {
  res.jsonp({ token: 'fake-csrf-token' });
});

// Logout
server.post('/logout', verifyToken, (req, res) => {
  res.status(200).jsonp({ message: 'Sesión cerrada' });
});

// Check email
server.post('/check-email', verifyToken, (req, res) => {
  const { email } = req.body;
  const db = router.db;
  const exists = db.get('users').find({ email }).value() ? true : false;
  res.jsonp({ exists });
});

// Register
server.post('/register', verifyToken, (req, res) => {
  const { username, email, password } = req.body;
  const db = router.db;

  if (db.get('users').find({ email }).value()) {
    return res.status(409).jsonp({ message: 'El correo ya está registrado' });
  }

  const newUser = {
    id: Date.now(),
    email,
    password,
    name: username
  };

  db.get('users').push(newUser).write();
  res.status(201).jsonp(newUser);
});

// -------------------------------------------------------

// Proteger rutas API
server.use(verifyToken);

// CRUD estándar
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});
