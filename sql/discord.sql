-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 12, 2020 at 09:58 AM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `discord`
--

-- --------------------------------------------------------

--
-- Table structure for table `greeting`
--

CREATE TABLE `greeting` (
  `greeting_id` int(11) NOT NULL,
  `greeting_guild` varchar(20) NOT NULL,
  `greeting_pattern` text NOT NULL,
  `greeting_img_head` text NOT NULL,
  `greeting_room` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `music_queue`
--

CREATE TABLE `music_queue` (
  `queue_id` int(11) NOT NULL,
  `queue_url` varchar(100) NOT NULL,
  `queue_server` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `server`
--

CREATE TABLE `server` (
  `server_order` int(11) NOT NULL,
  `server_id` int(11) NOT NULL,
  `server_voice_id` varchar(20) NOT NULL,
  `server_voice_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `greeting`
--
ALTER TABLE `greeting`
  ADD PRIMARY KEY (`greeting_id`);

--
-- Indexes for table `music_queue`
--
ALTER TABLE `music_queue`
  ADD PRIMARY KEY (`queue_id`);

--
-- Indexes for table `server`
--
ALTER TABLE `server`
  ADD PRIMARY KEY (`server_order`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `greeting`
--
ALTER TABLE `greeting`
  MODIFY `greeting_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `music_queue`
--
ALTER TABLE `music_queue`
  MODIFY `queue_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `server`
--
ALTER TABLE `server`
  MODIFY `server_order` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
