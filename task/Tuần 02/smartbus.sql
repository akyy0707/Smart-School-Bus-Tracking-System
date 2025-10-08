-- Database: QuanLyXeBuyt (phiên bản rút gọn theo yêu cầu)
DROP DATABASE IF EXISTS QuanLyXeBuyt;
CREATE DATABASE QuanLyXeBuyt;
USE QuanLyXeBuyt;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS bus_tracking;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS route_stops;
DROP TABLE IF EXISTS stops;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS buses;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================
-- BẢNG USERS
-- =====================
CREATE TABLE users (
  user_id CHAR(36) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin','dispatch','driver','parent') DEFAULT 'parent',
  is_active TINYINT(1) DEFAULT 1,
  avatar VARCHAR(255),
  create_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delete_at DATETIME DEFAULT NULL,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG ROUTES
-- =====================
CREATE TABLE routes (
  route_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  start_location VARCHAR(255) NOT NULL,
  end_location VARCHAR(255) NOT NULL,
  distance DECIMAL(8,2),
  estimated_duration INT,
  is_active TINYINT(1) DEFAULT 1,
  create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delete_at DATETIME DEFAULT NULL,
  PRIMARY KEY (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG STOPS
-- =====================
CREATE TABLE stops (
  stop_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  type ENUM('pickup','dropoff','both') DEFAULT 'both',
  is_active TINYINT(1) DEFAULT 1,
  create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delete_at DATETIME DEFAULT NULL,
  PRIMARY KEY (stop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG ROUTE_STOPS (liên kết tuyến - trạm)
-- =====================
CREATE TABLE route_stops (
  route_id CHAR(36) NOT NULL,
  stop_id CHAR(36) NOT NULL,
  sequence INT NOT NULL,
  estimated_time INT,
  distance DECIMAL(8,2),
  create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (route_id, stop_id),
  FOREIGN KEY (route_id) REFERENCES routes(route_id),
  FOREIGN KEY (stop_id) REFERENCES stops(stop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG BUSES
-- =====================
CREATE TABLE buses (
  bus_id CHAR(36) NOT NULL,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  capacity INT NOT NULL,
  model VARCHAR(50),
  status ENUM('active','maintenance','inactive') DEFAULT 'active',
  driver_id CHAR(36),
  current_lat DECIMAL(10,8),
  fuel_level DECIMAL(5,2),
  mileage INT DEFAULT 0,
  last_location_update DATETIME,
  create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delete_at DATETIME DEFAULT NULL,
  PRIMARY KEY (bus_id),
  FOREIGN KEY (driver_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG STUDENTS
-- =====================
CREATE TABLE students (
  student_id CHAR(36) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  class VARCHAR(50),
  parent_id CHAR(36) NOT NULL,
  route_id CHAR(36),
  is_active TINYINT(1) DEFAULT 1,
  create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delete_at DATETIME DEFAULT NULL,
  PRIMARY KEY (student_id),
  FOREIGN KEY (parent_id) REFERENCES users(user_id),
  FOREIGN KEY (route_id) REFERENCES routes(route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG SCHEDULES
-- =====================
CREATE TABLE schedules (
  schedule_id CHAR(36) NOT NULL,
  bus_id CHAR(36) NOT NULL,
  route_id CHAR(36) NOT NULL,
  type ENUM('pickup','dropoff') NOT NULL,
  start_time TIME NOT NULL,
  days JSON NOT NULL,
  notes TEXT,
  is_active TINYINT(1) DEFAULT 1,
  create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (schedule_id),
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id),
  FOREIGN KEY (route_id) REFERENCES routes(route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG BUS_TRACKING
-- =====================
CREATE TABLE bus_tracking (
  tracking_id CHAR(36) NOT NULL,
  bus_id CHAR(36) NOT NULL,
  driver_id CHAR(36),
  latitude DECIMAL(10,8) NOT NULL,
  speed DECIMAL(5,2),
  status ENUM('moving','stopped','idle') DEFAULT 'idle',
  route_id CHAR(36),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (tracking_id),
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id),
  FOREIGN KEY (driver_id) REFERENCES users(user_id),
  FOREIGN KEY (route_id) REFERENCES routes(route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- BẢNG NOTIFICATIONS
-- =====================
CREATE TABLE notifications (
  notification_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  type ENUM('info','warning','alert','success') DEFAULT 'info',
  category ENUM('bus_arrival','delay','cancellation','route_change','general') DEFAULT 'general',
  is_read TINYINT(1) DEFAULT 0,
  data JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delete_at DATETIME DEFAULT NULL,
  PRIMARY KEY (notification_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
