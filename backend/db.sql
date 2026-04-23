DROP DATABASE IF EXISTS ista_connect;
CREATE DATABASE ista_connect;
USE ista_connect;

-- FILIERES
CREATE TABLE filieres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('stagiaire','formateur','admin') DEFAULT 'stagiaire',
  avatar VARCHAR(255) NULL,
  filiere_id INT NULL,
  bio TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE SET NULL
);

-- POSTS
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- POST MEDIA (multiple images/videos per post)
CREATE TABLE post_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  type ENUM('image','video') DEFAULT 'image',
  `order` INT DEFAULT 0,
  created_at TIMESTAMP NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- COMMENTS (with reply threading via parent_id)
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  parent_id INT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- LIKES
CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP NULL,
  UNIQUE KEY unique_like (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- FOLLOWS
CREATE TABLE follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP NULL,
  UNIQUE KEY unique_follow (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- LOST & FOUND
CREATE TABLE lost_found (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('lost','found') NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(150) NULL,
  status ENUM('open','claimed','resolved') DEFAULT 'open',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- LOST & FOUND MEDIA
CREATE TABLE lost_found_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lost_found_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  `order` INT DEFAULT 0,
  created_at TIMESTAMP NULL,
  FOREIGN KEY (lost_found_id) REFERENCES lost_found(id) ON DELETE CASCADE
);

-- CLAIMS
CREATE TABLE claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lost_found_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (lost_found_id) REFERENCES lost_found(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- FEEDBACK
CREATE TABLE feedbacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  category ENUM('infrastructure','teaching','administration','other') DEFAULT 'other',
  status ENUM('pending','reviewed','archived') DEFAULT 'pending',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- REPORTS (polymorphic — can report a post, comment, or user)
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT NOT NULL,
  reportable_id INT NOT NULL,
  reportable_type ENUM('post','comment','user') NOT NULL,
  reason ENUM('spam','harassment','inappropriate','other') NOT NULL,
  status ENUM('pending','reviewed','dismissed') DEFAULT 'pending',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  data JSON NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------
-- SEEDS
-- -----------------------------------------------

INSERT INTO filieres (name, code) VALUES
('Développement Digital', 'DEV'),
('Infrastructure Digitale', 'ID'),
('Intelligence Artificielle', 'IA');

INSERT INTO users (name, email, password, role) VALUES
('Admin ISTA', 'admin@ista.ma', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9IYp0gK6n0B5J8Rr9g6Y2G', 'admin');
