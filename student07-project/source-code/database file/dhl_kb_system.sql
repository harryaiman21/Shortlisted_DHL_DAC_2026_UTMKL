-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2026 at 11:07 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dhl_kb_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `status` varchar(50) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fileName` varchar(255) DEFAULT NULL,
  `fileType` varchar(50) DEFAULT NULL,
  `filePath` text DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `steps` longtext DEFAULT NULL,
  `roles` longtext DEFAULT NULL,
  `keyPoints` longtext DEFAULT NULL,
  `risks` longtext DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `rawText` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `title`, `content`, `status`, `createdAt`, `updatedAt`, `fileName`, `fileType`, `filePath`, `summary`, `steps`, `roles`, `keyPoints`, `risks`, `notes`, `rawText`) VALUES
(2, 'server error 123', 'rewrite the code in the image exactly as is don\'t add anything don\'t omit anything and include all symbols like _ or \" \".\n\nhttp://localhost/SmartAA-System/index.html', 'published', '2026-05-12 15:11:01', '2026-05-12 15:11:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'Invalid Customer Address', '{\"title\":\"Invalid Customer Address\",\"summary\":\"Postcode is missing from the customer\'s address. The issue can be resolved by adding the postcode manually, revalidating the address, and saving the booking.\",\"steps\":[\"Add postcode manually\",\"Revalidate address\",\"Save and continue booking\"],\"notes\":\"\"}', 'completed', '2026-05-14 09:12:44', '2026-05-14 09:14:15', NULL, NULL, NULL, 'Postcode is missing from the customer\'s address. The issue can be resolved by adding the postcode manually, revalidating the address, and saving the booking.', '[\"Add postcode manually\",\"Revalidate address\",\"Save and continue booking\"]', '[]', '[]', '[]', '', NULL),
(34, 'Booking Checklist', '{\"title\":\"Booking Checklist\",\"summary\":\"Professional verification of essential details for successful DHL shipment booking.\",\"steps\":[\"Verify Customer PO\",\"Confirm Correct Incoterm\",\"Confirm Pickup date\",\"Verify Weight & dimensions\"],\"risks\":[\"Rejection of booking if any missing details\"],\"notes\":\"\"}', 'completed', '2026-05-14 12:06:26', '2026-05-14 12:07:57', NULL, NULL, NULL, 'Professional verification of essential details for successful DHL shipment booking.', '[\"Verify Customer PO\",\"Confirm Correct Incoterm\",\"Confirm Pickup date\",\"Verify Weight & dimensions\"]', '[]', '[]', '[\"Rejection of booking if any missing details\"]', '', NULL),
(45, 'AI Processing Failed', '{\"title\":\"AI Processing Failed\",\"summary\":\"Warehouse Issue:\\nScanner not working in Zone B.\\nFix:\\n- Restart device\\n- Check connection\",\"steps\":[],\"roles\":[],\"keyPoints\":[],\"risks\":[],\"notes\":\"Fallback mode used\"}', 'published', '2026-05-14 20:16:56', '2026-05-14 20:57:37', NULL, NULL, NULL, 'Warehouse Issue:\nScanner not working in Zone B.\nFix:\n- Restart device\n- Check connection', '[]', '[]', '[]', '[]', 'Fallback mode used', NULL),
(46, 'Resolving Scanner Malfunction in Warehouse Zone B', '{\"title\":\"Resolving Scanner Malfunction in Warehouse Zone B\",\"summary\":\"To address the non-operational scanner issue within Zone B, follow these troubleshooting steps.\",\"steps\":[{\"stepNumber\":1,\"action\":\"Restart device\"},{\"stepNumber\":2,\"action\":\"Check connection\"}],\"roles\":[\"Warehouse Operator\",\"IT Support Technician\"],\"keyPoints\":[\"Restart the scanner device to refresh its system.\",\"Verify that all cables and connections are securely plugged in.\"],\"risks\":[\"Continued malfunction could lead to delays in inventory processing\",\"Potential data entry errors if the scanner issue persists\"],\"notes\":\"\"}', 'completed', '2026-05-14 20:16:56', '2026-05-14 20:22:06', NULL, NULL, NULL, 'To address the non-operational scanner issue within Zone B, follow these troubleshooting steps.', '[{\"stepNumber\":1,\"action\":\"Restart device\"},{\"stepNumber\":2,\"action\":\"Check connection\"}]', '[\"Warehouse Operator\",\"IT Support Technician\"]', '[\"Restart the scanner device to refresh its system.\",\"Verify that all cables and connections are securely plugged in.\"]', '[\"Continued malfunction could lead to delays in inventory processing\",\"Potential data entry errors if the scanner issue persists\"]', '', NULL),
(47, 'AI Generated Article', '{\"title\":\"AI Generated Article\",\"summary\":\"Shipment stuck due to Invalid Routing Code; ensure correct country codes.\",\"steps\":[\"Refresh shipment data\",\"Log out and reprocess\"],\"roles\":[\"Team\"],\"keyPoints\":[\"Ensure the use of MY for Myanmar instead of SG (Singapore)\",\"Validate routing codes before dispatching shipments.\"],\"risks\":[\"Potential delays due to incorrect country code\",\"Increased likelihood of repeated issues without proper data validation\"],\"notes\":\"\"}', 'completed', '2026-05-14 21:01:50', '2026-05-14 21:05:41', NULL, NULL, NULL, 'Shipment stuck due to Invalid Routing Code; ensure correct country codes.', '[\"Refresh shipment data\",\"Log out and reprocess\"]', '[\"Team\"]', '[\"Ensure the use of MY for Myanmar instead of SG (Singapore)\",\"Validate routing codes before dispatching shipments.\"]', '[\"Potential delays due to incorrect country code\",\"Increased likelihood of repeated issues without proper data validation\"]', '', NULL),
(48, 'AI Processing Failed', '{\"title\":\"AI Processing Failed\",\"summary\":\"7:04 AM\\nHey team, shipment 784512 got stuck again. System says Invalid Routing Code. Last\\ntime this happened we refreshed the shipment data, logged out, and reprocessed. Also\\nmake sure country code is MY not SG. If still fails, raise ticket to IT with screenshot.\",\"steps\":[],\"roles\":[],\"keyPoints\":[],\"risks\":[],\"notes\":\"Fallback mode used\"}', 'completed', '2026-05-14 21:15:59', '2026-05-14 21:21:52', NULL, NULL, NULL, '7:04 AM\nHey team, shipment 784512 got stuck again. System says Invalid Routing Code. Last\ntime this happened we refreshed the shipment data, logged out, and reprocessed. Also\nmake sure country code is MY not SG. If still fails, raise ticket to IT with screenshot.', '[]', '[]', '[]', '[]', 'Fallback mode used', NULL),
(49, 'AI Processing Failed', '{\"title\":\"AI Processing Failed\",\"summary\":\"Customer Credit Approval and New Customer Onboarding Process Document Status: Draft (Unstandardized) Business Unit: DHL Logistics Operations Process Owner: Operations & Finance Last Updated: Not maintained consistently 1. Purpose The purpose of this Standard Operating Procedure (SOP) is to document \",\"steps\":[],\"roles\":[],\"keyPoints\":[],\"risks\":[],\"notes\":\"Fallback mode used\"}', 'completed', '2026-05-14 22:43:17', '2026-05-14 22:48:40', NULL, NULL, NULL, 'Customer Credit Approval and New Customer Onboarding Process Document Status: Draft (Unstandardized) Business Unit: DHL Logistics Operations Process Owner: Operations & Finance Last Updated: Not maintained consistently 1. Purpose The purpose of this Standard Operating Procedure (SOP) is to document ', '[]', '[]', '[]', '[]', 'Fallback mode used', NULL),
(50, 'AI Processing Failed', '{\"title\":\"AI Processing Failed\",\"summary\":\"Warehouse Issue:\\nScanner not working in Zone B.\\nFix:\\n- Restart device\\n- Check connection\",\"steps\":[],\"roles\":[],\"keyPoints\":[],\"risks\":[],\"notes\":\"Fallback mode used\"}', 'completed', '2026-05-14 22:43:17', '2026-05-14 22:48:38', NULL, NULL, NULL, 'Warehouse Issue:\nScanner not working in Zone B.\nFix:\n- Restart device\n- Check connection', '[]', '[]', '[]', '[]', 'Fallback mode used', NULL),
(51, 'Operational Incident Report', '{\"title\":\"Operational Incident Report\",\"summary\":\"Customer Credit Approval and New Customer Onboarding Process Document Status: Draft (Unstandardized) Business Unit: DHL Logistics Operations Process Owner: Operations & Finance Last Updated: Not maintained consistently 1. Purpose The purpose of this Standard Operating Procedure (SOP) is to document \",\"steps\":[],\"roles\":[],\"keyPoints\":[],\"risks\":[],\"notes\":\"Fallback mode used due to system error\"}', 'completed', '2026-05-15 08:04:10', '2026-05-15 08:04:11', NULL, NULL, NULL, 'Customer Credit Approval and New Customer Onboarding Process Document Status: Draft (Unstandardized) Business Unit: DHL Logistics Operations Process Owner: Operations & Finance Last Updated: Not maintained consistently 1. Purpose The purpose of this Standard Operating Procedure (SOP) is to document ', '[]', '[]', '[]', '[]', 'Fallback mode used due to system error', NULL),
(52, 'Operational Incident Report', '{\"title\":\"Operational Incident Report\",\"summary\":\"Warehouse Issue:\\nScanner not working in Zone B.\\nFix:\\n- Restart device\\n- Check connection\",\"steps\":[],\"roles\":[],\"keyPoints\":[],\"risks\":[],\"notes\":\"Fallback mode used due to system error\"}', 'completed', '2026-05-15 08:04:11', '2026-05-15 08:04:11', NULL, NULL, NULL, 'Warehouse Issue:\nScanner not working in Zone B.\nFix:\n- Restart device\n- Check connection', '[]', '[]', '[]', '[]', 'Fallback mode used due to system error', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `uploads`
--

CREATE TABLE `uploads` (
  `id` int(11) NOT NULL,
  `fileName` varchar(255) DEFAULT NULL,
  `fileType` varchar(50) DEFAULT NULL,
  `filePath` text DEFAULT NULL,
  `articleId` int(11) DEFAULT NULL,
  `uploadedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `extractedText` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `uploads`
--

INSERT INTO `uploads` (`id`, `fileName`, `fileType`, `filePath`, `articleId`, `uploadedAt`, `extractedText`) VALUES
(1, '1778645655405-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.pdf', 'application/pdf', 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778645655405-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.pdf', 3, '2026-05-13 04:14:15', ''),
(2, '1778668946207-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.pdf', 'application/pdf', 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778668946207-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.pdf', 4, '2026-05-13 10:42:26', ''),
(3, 'Customer Credit Approval and New Customer Onboarding Process.pdf', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778670906907-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.pdf', 5, '2026-05-13 11:15:07', NULL),
(4, 'Customer address invalid..txt', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778671140017-Customer-address-invalid..txt', 6, '2026-05-13 11:19:00', NULL),
(5, 'Customer Credit Approval and New Customer Onboarding Process.docx', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778671252874-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.docx', 7, '2026-05-13 11:20:52', NULL),
(6, 'RE_ Invoice mismatch issue.msg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778671740963-RE_-Invoice-mismatch-issue.msg', 8, '2026-05-13 11:29:00', NULL),
(7, 'RE_ Invoice mismatch issue.msg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778671909509-RE_-Invoice-mismatch-issue.msg', 9, '2026-05-13 11:31:49', NULL),
(8, 'RE_ Invoice mismatch issue.msg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778672062934-RE_-Invoice-mismatch-issue.msg', 10, '2026-05-13 11:34:22', NULL),
(9, 'Teams Message 2.jpg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778672798764-Teams-Message-2.jpg', 11, '2026-05-13 11:46:40', NULL),
(10, 'Teams Message.jpg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778672951646-Teams-Message.jpg', 12, '2026-05-13 11:49:12', NULL),
(11, 'Customer address invalid..txt', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778724968276-Customer-address-invalid..txt', 13, '2026-05-14 02:16:08', NULL),
(12, 'Customer Credit Approval and New Customer Onboarding Process.pdf', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778724997072-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.pdf', 14, '2026-05-14 02:16:37', NULL),
(13, 'Customer Credit Approval and New Customer Onboarding Process.docx', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778725012055-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.docx', 15, '2026-05-14 02:16:52', NULL),
(14, 'Teams Message 2.jpg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778725027636-Teams-Message-2.jpg', 16, '2026-05-14 02:17:08', NULL),
(15, 'Customer address invalid..txt', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778725041969-Customer-address-invalid..txt', 17, '2026-05-14 02:17:21', NULL),
(16, 'RE_ Invoice mismatch issue.msg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778725067806-RE_-Invoice-mismatch-issue.msg', 18, '2026-05-14 02:17:47', NULL),
(17, 'Teams Message 2.jpg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778730567650-Teams-Message-2.jpg', 19, '2026-05-14 03:49:28', NULL),
(18, 'Customer Credit Approval and New Customer Onboarding Process.docx', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778730614331-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.docx', 20, '2026-05-14 03:50:14', NULL),
(19, 'Customer Credit Approval and New Customer Onboarding Process.pdf', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778730632674-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.pdf', 21, '2026-05-14 03:50:32', NULL),
(20, 'Customer address invalid..txt', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778730658477-Customer-address-invalid..txt', 22, '2026-05-14 03:50:58', NULL),
(21, 'Teams Message.jpg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778731431425-Teams-Message.jpg', 23, '2026-05-14 04:08:59', NULL),
(22, 'Teams Message 2.jpg', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778732155928-Teams-Message-2.jpg', 24, '2026-05-14 04:18:19', NULL),
(23, 'Customer Credit Approval and New Customer Onboarding Process.pdf', NULL, 'C:\\xampp\\htdocs\\dhl-kb-system\\server\\uploads\\1778732920658-Customer-Credit-Approval-and-New-Customer-Onboarding-Process.pdf', 25, '2026-05-14 04:33:49', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `uploads`
--
ALTER TABLE `uploads`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `uploads`
--
ALTER TABLE `uploads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
