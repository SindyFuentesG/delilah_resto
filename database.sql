CREATE DATABASE IF NOT EXISTS `delilah_resto`;
USE `delilah_resto`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
`id` int unsigned primary key auto_increment,  
`username` varchar (255) NOT NULL,
`password` varchar (255) NOT NULL,
`full_name` varchar (255) NOT NULL,
`email` varchar (255) NOT NULL,
`phone_number` varchar (255) NOT NULL,
`address` varchar (255) NOT NULL,
`is_admin` tinyint unsigned NOT NULL );

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
`id` int unsigned primary key auto_increment,
`name` varchar (255) NOT NULL,
`price`  decimal NOT NULL,
`photo` varchar (255) NOT NULL
);

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
`id` int unsigned primary key auto_increment,
`status` enum ('new', 'confirmed', 'preparing', 'sent', 'delivered', 'canceled') NOT NULL,
`payment_type` enum ('cash', 'card') NOT NULL,
`time` time NOT NULL,
`description` varchar (255) NOT NULL,
`amount` decimal NOT NULL,
`user_id` int unsigned NOT NULL,
 FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
`id` int unsigned primary key auto_increment,
`product_id` int unsigned NOT NULL,
`order_id` int unsigned NOT NULL, 
`quantity` int unsigned NOT NULL,
FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
);

SELECT * FROM products;

