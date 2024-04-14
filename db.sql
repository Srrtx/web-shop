-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 14, 2024 at 04:37 PM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.0.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `web-shop`
--
CREATE DATABASE IF NOT EXISTS `web-shop` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `web-shop`;

-- --------------------------------------------------------

--
-- Table structure for table `ordering`
--

CREATE TABLE `ordering` (
  `ordering_id` smallint(5) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `user_id` smallint(5) UNSIGNED NOT NULL,
  `status` tinyint(4) NOT NULL COMMENT '1=pending,2=accepted'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ordering`
--

INSERT INTO `ordering` (`ordering_id`, `date`, `user_id`, `status`) VALUES
(18, '2024-04-14', 2, 2),
(19, '2024-04-14', 3, 1),
(20, '2024-04-14', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `ordering_detail`
--

CREATE TABLE `ordering_detail` (
  `detail_id` smallint(5) UNSIGNED NOT NULL,
  `ordering_id` smallint(5) UNSIGNED NOT NULL,
  `product_id` smallint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ordering_detail`
--

INSERT INTO `ordering_detail` (`detail_id`, `ordering_id`, `product_id`) VALUES
(4, 18, 2),
(5, 18, 3),
(6, 19, 1),
(7, 19, 3),
(8, 20, 1),
(9, 20, 2);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `product_id` smallint(5) UNSIGNED NOT NULL,
  `name` varchar(20) NOT NULL,
  `price` mediumint(9) NOT NULL,
  `status` tinyint(3) UNSIGNED NOT NULL COMMENT '0=disable,1=enable'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `name`, `price`, `status`) VALUES
(1, 'hat', 199, 1),
(2, 'shirt', 299, 1),
(3, 'shoe', 399, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` smallint(5) UNSIGNED NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(60) NOT NULL,
  `role` tinyint(3) UNSIGNED NOT NULL COMMENT '1=admin,2=user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `password`, `role`) VALUES
(1, 'admin', '$2b$10$M23aCZPtFoa6WxhOGiqJX.24glWye/xCiz3C2zWFaTGV4jJJUnBG.', 1),
(2, 'user2', '$2b$10$x3zpT.1riEElQY/gLcQ08exiBiw.IBqb.1CsRjYOhBhJTyFt.TpMu', 2),
(3, 'user3', '$2b$10$yV.MsmLNanD39H/hXC7bD.3oU6oCppe2RicgjSXG0Lg1SJtp2U4Qe', 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ordering`
--
ALTER TABLE `ordering`
  ADD PRIMARY KEY (`ordering_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `ordering_detail`
--
ALTER TABLE `ordering_detail`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `ordering_id` (`ordering_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ordering`
--
ALTER TABLE `ordering`
  MODIFY `ordering_id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `ordering_detail`
--
ALTER TABLE `ordering_detail`
  MODIFY `detail_id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ordering`
--
ALTER TABLE `ordering`
  ADD CONSTRAINT `ordering_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `ordering_detail`
--
ALTER TABLE `ordering_detail`
  ADD CONSTRAINT `ordering_detail_ibfk_1` FOREIGN KEY (`ordering_id`) REFERENCES `ordering` (`ordering_id`),
  ADD CONSTRAINT `ordering_detail_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
